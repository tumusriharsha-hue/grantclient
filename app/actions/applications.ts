"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isGuestUser } from "@/lib/auth/session";
import {
  calculateDraftSectionProgress,
  type DraftSection,
} from "@/lib/applications/defaults";
import {
  buildInitialApplicationSections,
  proposalTemplate,
} from "@/lib/applications/proposal-template";
import { getGrantById } from "@/lib/grants/queries";
import { createClient } from "@/lib/supabase/server";
import {
  applicationStatusUpdateSchema,
  parseApplicationSetup,
  saveApplicationDraftSchema,
} from "@/lib/validations/application";
import type {
  ApplicationUpdate,
  Json,
} from "@/types/database";

export type ApplicationActionResult =
  | { success: true }
  | { success: false; error: string };

export type ApplicationSetupActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function requireFullUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (isGuestUser(user)) {
    redirect("/signup?reason=account");
  }

  return { supabase, user };
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseDateInput(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 12).toISOString();
}

function applicationSetupFieldErrors(
  error: NonNullable<ReturnType<typeof parseApplicationSetup>["error"]>,
) {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return fieldErrors;
}

function isMissingApplicationSectionsError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    /application_sections|schema cache|relation .* does not exist/i.test(error?.message ?? "")
  );
}

function isMissingApplicationColumnError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST204" ||
    /schema cache|could not find.*column|column .* does not exist/i.test(
      error?.message ?? "",
    )
  );
}

export async function startApplicationDraft(
  _previousState: ApplicationSetupActionState,
  formData: FormData,
): Promise<ApplicationSetupActionState> {
  const { supabase, user } = await requireFullUser();
  const applicationId = getFormString(formData, "applicationId");
  const parsed = parseApplicationSetup(formData);
  if (!parsed.success) {
    return {
      error: "Please complete the required application setup fields.",
      fieldErrors: applicationSetupFieldErrors(parsed.error),
    };
  }

  const setup = parsed.data;
  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (organizationError || !organization) {
    return { error: "Complete your organization profile before starting an application." };
  }

  if (setup.selectedDocumentIds.length > 0) {
    const { data: selectedDocuments, error: documentError } = await supabase
      .from("organization_documents")
      .select("id")
      .eq("user_id", user.id)
      .eq("organization_id", organization.id)
      .in("id", setup.selectedDocumentIds);
    if (documentError || selectedDocuments?.length !== setup.selectedDocumentIds.length) {
      return { error: "One or more selected supporting documents are unavailable." };
    }
  }

  const grant = setup.grantId
    ? await getGrantById(setup.grantId).catch(() => null)
    : null;
  if (setup.grantId && !grant) {
    return { error: "The selected grant could not be verified." };
  }

  const grantQuestions = grant?.applicationQuestions ?? [];
  for (const question of grantQuestions) {
    if (question.required && !setup.grantQuestionResponses[question.id]?.trim()) {
      return {
        error: "Please answer all required funder questions.",
        fieldErrors: { [`grantQuestion:${question.id}`]: "Required" },
      };
    }
  }
  const verifiedSetup = {
    ...setup,
    grantQuestionResponses: Object.fromEntries(
      grantQuestions
        .filter((question) => setup.grantQuestionResponses[question.id]?.trim())
        .map((question) => [question.id, setup.grantQuestionResponses[question.id].trim()]),
    ),
  };

  const grantId = grant?.id ?? null;
  const title = grant ? `${grant.title} Application` : `${setup.projectName} Application`;
  const grantSnapshot = grant
    ? {
        id: grant.id,
        title: grant.title,
        funder: grant.funder,
        category: grant.category,
        deadline: grant.deadline ?? null,
        rollingDeadline: grant.rollingDeadline ?? false,
        awardMin: grant.awardMin ?? grant.amount ?? null,
        awardMax: grant.awardMax ?? grant.amount ?? null,
        applicationUrl: grant.applicationUrl,
        sourceUrl: grant.sourceUrl ?? null,
        verifiedAt: grant.verifiedAt ?? null,
        updatedAt: grant.updatedAt,
      }
    : {};

  const initialSections = buildInitialApplicationSections(organization, verifiedSetup, grant);
  const initialProgress = calculateDraftSectionProgress(
    initialSections.map((section) => section.content),
    proposalTemplate.length,
  );
  const legacyDraft = initialSections.map((section) => ({
    title: section.title,
    body: section.content,
  }));

  const existingQuery = applicationId
    ? await supabase
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("id", applicationId)
        .maybeSingle()
    : grantId
      ? await supabase
        .from("applications")
        .select("id")
        .eq("user_id", user.id)
        .eq("grant_id", grantId)
        .maybeSingle()
      : { data: null, error: null };

  if (existingQuery.error) {
    return { error: "Unable to check for an existing application." };
  }
  if (applicationId && !existingQuery.data) {
    return { error: "The application you tried to edit could not be found." };
  }

  const applicationPayload = {
    user_id: user.id,
    organization_id: organization.id,
    grant_id: grantId,
    grant_title: grant?.title ?? null,
    grant_funder: grant?.funder ?? null,
    grant_category: grant?.category ?? null,
    application_url: grant?.applicationUrl ?? null,
    grant_snapshot: grantSnapshot as Json,
    setup_data: verifiedSetup as unknown as Json,
    amount_requested: setup.amountRequested,
    amount: `$${setup.amountRequested.toLocaleString("en-US")}`,
    title,
    status: "drafting",
    progress: initialProgress,
    draft_content: legacyDraft as unknown as Json,
    last_updated_at: new Date().toISOString(),
  };

  const editPayload: ApplicationUpdate = { ...applicationPayload };
  delete editPayload.draft_content;
  delete editPayload.progress;
  let applicationResult = existingQuery.data
    ? await supabase
        .from("applications")
        .update(editPayload)
        .eq("user_id", user.id)
        .eq("id", existingQuery.data.id)
        .select("id")
        .single()
    : await supabase
        .from("applications")
        .insert(applicationPayload)
        .select("id")
        .single();

  if (applicationResult.error && isMissingApplicationColumnError(applicationResult.error)) {
    const compatibleInsertPayload = {
      user_id: user.id,
      grant_id: grantId,
      grant_title: grant?.title ?? null,
      grant_funder: grant?.funder ?? null,
      grant_category: grant?.category ?? null,
      application_url: grant?.applicationUrl ?? null,
      amount: `$${setup.amountRequested.toLocaleString("en-US")}`,
      title,
      status: "drafting",
      progress: initialProgress,
      draft_content: legacyDraft as unknown as Json,
      last_updated_at: new Date().toISOString(),
    };
    const compatibleEditPayload: ApplicationUpdate = {
      ...compatibleInsertPayload,
    };
    delete compatibleEditPayload.draft_content;
    delete compatibleEditPayload.progress;

    applicationResult = existingQuery.data
      ? await supabase
          .from("applications")
          .update(compatibleEditPayload)
          .eq("user_id", user.id)
          .eq("id", existingQuery.data.id)
          .select("id")
          .single()
      : await supabase
          .from("applications")
          .insert(compatibleInsertPayload)
          .select("id")
          .single();
  }

  if (applicationResult.error) {
    return { error: "Unable to save the application setup." };
  }

  const sectionsToSave = applicationId
    ? initialSections.filter((section) =>
        proposalTemplate.some(
          (template) =>
            template.id === section.section_key && template.deterministic,
        ),
      )
    : initialSections;
  const sectionRows = sectionsToSave.map((section) => ({
    application_id: applicationResult.data.id,
    user_id: user.id,
    ...section,
    used_source_fields: section.used_source_fields as Json,
  }));
  const { error: sectionError } = await supabase
    .from("application_sections")
    .upsert(sectionRows, { onConflict: "application_id,section_key", ignoreDuplicates: false });

  if (sectionError && !isMissingApplicationSectionsError(sectionError)) {
    return { error: "Unable to initialize proposal sections." };
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");

  redirect(`/applications/builder/draft?id=${applicationResult.data.id}`);
}

export async function saveApplicationDraft(input: {
  id: string;
  title: string;
  sections: DraftSection[];
}): Promise<ApplicationActionResult> {
  const { supabase, user } = await requireFullUser();
  const parsed = saveApplicationDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid application draft." };
  }
  const title = parsed.data.title || "Untitled Application";
  const sections = parsed.data.sections
    .map((section) => ({
      id: section.id,
      sectionKey: section.sectionKey,
      title: section.title.trim(),
      body: section.body.trim(),
      status: section.status ?? "draft",
      previousBody: section.previousBody,
    }))
    .filter((section) => section.title);

  const { error } = await supabase
    .from("applications")
    .update({
      title,
      draft_content: sections as unknown as Json,
      last_updated_at: new Date().toISOString(),
      progress: calculateDraftSectionProgress(
        sections.map((section) => section.body),
        proposalTemplate.length,
      ),
    })
    .eq("user_id", user.id)
    .eq("id", input.id);

  if (error) {
    return { success: false, error: "Unable to save the application draft." };
  }

  const structuredSections = sections.filter(
    (section): section is typeof section & { sectionKey: string } => Boolean(section.sectionKey),
  );
  if (structuredSections.length > 0) {
    const rows = structuredSections.map((section) => ({
      application_id: input.id,
      user_id: user.id,
      section_key: section.sectionKey,
      title: section.title,
      content: section.body,
      previous_content: section.previousBody ?? null,
      status: section.status,
      template_version: "v1",
    }));
    const { error: sectionError } = await supabase
      .from("application_sections")
      .upsert(rows, { onConflict: "application_id,section_key" });
    if (sectionError) {
      return { success: false, error: "Unable to save proposal sections." };
    }
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${input.id}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateApplicationStatus(formData: FormData) {
  const { supabase, user } = await requireFullUser();
  const parsed = applicationStatusUpdateSchema.safeParse({
    applicationId: getFormString(formData, "applicationId"),
    title: getFormString(formData, "title"),
    status: getFormString(formData, "status"),
    statusDate: getFormString(formData, "statusDate"),
    nextDate: getFormString(formData, "nextDate"),
    amount: getFormString(formData, "amount") || null,
    statusNote: getFormString(formData, "statusNote") || null,
  });
  if (!parsed.success) {
    throw new Error("Invalid application status update.");
  }
  const { applicationId: id, title, status, amount, statusNote } = parsed.data;
  const statusDate = parsed.data.statusDate ? parseDateInput(parsed.data.statusDate) : null;
  const nextDate = parsed.data.nextDate ? parseDateInput(parsed.data.nextDate) : null;

  const update: ApplicationUpdate = {
    title,
    status,
    amount,
    status_note: statusNote,
  };
  if (status !== "drafting") {
    update.progress = 100;
  }

  if (status === "drafting") {
    update.last_updated_at = statusDate ?? new Date().toISOString();
    update.submitted_at = null;
    update.decision_at = null;
  } else if (status === "submitted") {
    update.submitted_at = statusDate;
    update.decision_at = null;
  } else {
    update.submitted_at = statusDate;
    update.decision_at = nextDate;
  }

  const { error } = await supabase
    .from("applications")
    .update(update)
    .eq("user_id", user.id)
    .eq("id", id);

  if (error) {
    throw new Error("Unable to update the application status.");
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath(`/applications/status/${id}`);
  revalidatePath("/dashboard");

  redirect(`/applications/${id}`);
}
