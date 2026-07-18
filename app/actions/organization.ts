"use server";

import { revalidatePath } from "next/cache";
import { isGuestUser } from "@/lib/auth/session";
import { buildLocationFromStateCity } from "@/lib/onboarding/helpers";
import { createClient } from "@/lib/supabase/server";
import { isOwnProfilePictureUrl } from "@/lib/storage/profile-pictures";
import {
  normalizeOptionalWebsite,
  onboardingCompleteSchema,
  organizationToOnboardingValues,
  validateOnboardingStep,
  type OnboardingFormValues,
} from "@/lib/validations/onboarding";
import type { Organization } from "@/types/database";
import {
  normalizeOrganizationType,
  organizationTypeToStorageValue,
} from "@/types/organization";

export type OrganizationActionResult =
  | { success: true; organization: Organization }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

const MIGRATION_PENDING_ORGANIZATION_COLUMNS = [
  "nonprofit_status",
  "programs",
  "impact_goals",
  "previous_grant_experience",
  "website",
  "requested_funding_min",
  "requested_funding_max",
] as const;

export async function getOrganizationForUser(): Promise<Organization | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load the organization profile.");
  }

  return data;
}

function buildOrganizationPayload(
  userId: string,
  values: OnboardingFormValues,
  step: number,
  complete: boolean,
) {
  const missionCategories = values.mission_categories ?? [];
  const location = buildLocationFromStateCity(values.state, values.city);

  return {
    user_id: userId,
    organization_name: values.organization_name?.trim() || "Untitled Organization",
    organization_type: organizationTypeToStorageValue(
      normalizeOrganizationType(values.organization_type),
    ),
    has_501c3: values.has_501c3 ?? false,
    is_501c3: values.has_501c3 ?? false,
    nonprofit_status: values.has_501c3 ? "501c3" : "nonprofit",
    mission_categories: missionCategories,
    programs: values.programs ?? [],
    impact_goals: values.impact_goals?.trim() || null,
    populations_served: values.populations_served ?? [],
    state: values.state?.trim() || null,
    city: values.city?.trim() || null,
    annual_budget_range: values.annual_budget_range || null,
    previous_grant_experience: values.previous_grant_experience?.trim() || null,
    website: normalizeOptionalWebsite(values.website) || null,
    organization_age_range: values.organization_age_range ?? null,
    preferred_grant_amount: values.preferred_grant_amount || null,
    requested_funding_min: values.requested_funding_min ?? null,
    requested_funding_max: values.requested_funding_max ?? null,
    preferred_grant_types: values.preferred_grant_types ?? [],
    accept_government_grants: values.accept_government_grants ?? true,
    keywords: missionCategories,
    mission: values.mission?.trim() || null,
    location,
    budget: values.budget ?? null,
    onboarding_step: step,
    onboarding_completed: complete,
  };
}

function buildOrganizationCompatibilityPayload(
  payload: ReturnType<typeof buildOrganizationPayload>,
) {
  const compatiblePayload = { ...payload };

  for (const column of MIGRATION_PENDING_ORGANIZATION_COLUMNS) {
    delete compatiblePayload[column];
  }

  return compatiblePayload;
}

function isSchemaCacheColumnError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST204" ||
    /schema cache|could not find.*column/i.test(error?.message ?? "")
  );
}

export async function saveOnboardingProgress(
  values: OnboardingFormValues,
  step: number,
  complete = false,
  validationStep = step,
): Promise<OrganizationActionResult> {
  if (complete) {
    const parsed = onboardingCompleteSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      return {
        success: false,
        error: "Please complete all required fields.",
        fieldErrors,
      };
    }
  } else {
    const validation = validateOnboardingStep(validationStep, values);
    if (!validation.success) {
      return {
        success: false,
        error: "Please fix the errors below.",
        fieldErrors: validation.fieldErrors,
      };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Sign in to save your organization profile." };
  }

  if (isGuestUser(user)) {
    return {
      success: false,
      error: "Create a free account to set up your organization profile.",
    };
  }

  const payload = buildOrganizationPayload(user.id, values, step, complete);

  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  let { data, error } = existing
    ? await supabase
        .from("organizations")
        .update(payload)
        .eq("user_id", user.id)
        .select("*")
        .single()
    : await supabase.from("organizations").insert(payload).select("*").single();

  if (error && isSchemaCacheColumnError(error)) {
    const compatiblePayload = buildOrganizationCompatibilityPayload(payload);
    const retryResult = existing
      ? await supabase
          .from("organizations")
          .update(compatiblePayload)
          .eq("user_id", user.id)
          .select("*")
          .single()
      : await supabase
          .from("organizations")
          .insert(compatiblePayload)
          .select("*")
          .single();

    data = retryResult.data;
    error = retryResult.error;
  }

  if (error || !data) {
    return { success: false, error: "Unable to save the organization profile." };
  }

  if (existing) {
    const { data: applications } = await supabase
      .from("applications")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", data.id);
    const applicationIds = (applications ?? []).map((application) => application.id);
    if (applicationIds.length > 0) {
      await supabase
        .from("application_sections")
        .update({ status: "stale" })
        .eq("user_id", user.id)
        .in("application_id", applicationIds)
        .not("generated_at", "is", null);
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/grants");

  return { success: true, organization: data };
}

/** @deprecated Use saveOnboardingProgress */
export async function saveOrganizationProfile(
  input: Record<string, unknown>,
): Promise<OrganizationActionResult> {
  const values = organizationToOnboardingValues(null);
  return saveOnboardingProgress(
    {
      ...values,
      organization_name: String(input.organization_name ?? ""),
      organization_type: normalizeOrganizationType(input.organization_type),
      has_501c3: Boolean(input.is_501c3),
      mission_categories: ((input.keywords as string[] | undefined) ??
        []) as OnboardingFormValues["mission_categories"],
      state: String(input.location ?? "").slice(0, 2),
      city: "",
    },
    6,
    true,
  );
}

export async function updateOrganizationProfilePicture(
  profilePictureUrl: string | null,
): Promise<OrganizationActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Sign in to update your profile picture." };
  }

  if (isGuestUser(user)) {
    return {
      success: false,
      error: "Create a free account to update your profile picture.",
    };
  }

  if (profilePictureUrl) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

    if (
      !supabaseUrl ||
      !isOwnProfilePictureUrl(profilePictureUrl, user.id, supabaseUrl)
    ) {
      return { success: false, error: "Invalid profile picture URL." };
    }
  }

  const { data, error } = await supabase
    .from("organizations")
    .update({ profile_picture_url: profilePictureUrl })
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: "Unable to update the profile picture." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true, organization: data };
}
