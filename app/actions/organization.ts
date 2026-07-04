"use server";

import { revalidatePath } from "next/cache";
import { isGuestUser } from "@/lib/auth/session";
import {
  budgetRangeToAmount,
  buildLocationFromStateCity,
  buildMissionFromCategories,
} from "@/lib/onboarding/helpers";
import { createClient } from "@/lib/supabase/server";
import {
  onboardingCompleteSchema,
  organizationToOnboardingValues,
  validateOnboardingStep,
  type OnboardingFormValues,
} from "@/lib/validations/onboarding";
import type { Organization } from "@/types/database";

export type OrganizationActionResult =
  | { success: true; organization: Organization }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

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
    throw new Error(error.message);
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
    organization_type: values.organization_type ?? "Other",
    has_501c3: values.has_501c3 ?? false,
    is_501c3: values.has_501c3 ?? false,
    mission_categories: missionCategories,
    populations_served: values.populations_served ?? [],
    state: values.state?.trim() || null,
    city: values.city?.trim() || null,
    annual_budget_range: values.annual_budget_range ?? null,
    organization_age_range: values.organization_age_range ?? null,
    preferred_grant_amount: values.preferred_grant_amount ?? null,
    preferred_grant_types: values.preferred_grant_types ?? [],
    accept_government_grants: values.accept_government_grants ?? true,
    keywords: missionCategories,
    mission: buildMissionFromCategories(missionCategories),
    location,
    budget: budgetRangeToAmount(values.annual_budget_range ?? null),
    onboarding_step: step,
    onboarding_completed: complete,
  };
}

export async function saveOnboardingProgress(
  values: OnboardingFormValues,
  step: number,
  complete = false,
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
    const validation = validateOnboardingStep(step, values);
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

  const { data, error } = existing
    ? await supabase
        .from("organizations")
        .update(payload)
        .eq("user_id", user.id)
        .select("*")
        .single()
    : await supabase.from("organizations").insert(payload).select("*").single();

  if (error) {
    return { success: false, error: error.message };
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
      organization_type: String(input.organization_type ?? "Other") as OnboardingFormValues["organization_type"],
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
