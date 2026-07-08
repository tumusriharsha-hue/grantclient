"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isGuestUser } from "@/lib/auth/session";
import {
  buildDefaultDraftSections,
  type DraftSection,
} from "@/lib/applications/defaults";
import { createClient } from "@/lib/supabase/server";
import type {
  ApplicationStatus,
  ApplicationUpdate,
  Json,
} from "@/types/database";

export type ApplicationActionResult =
  | { success: true }
  | { success: false; error: string };

const applicationStatuses: ApplicationStatus[] = [
  "drafting",
  "submitted",
  "approved",
  "rejected",
];

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

function normalizeStatus(value: string): ApplicationStatus {
  return applicationStatuses.includes(value as ApplicationStatus)
    ? (value as ApplicationStatus)
    : "drafting";
}

function parseDateInput(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 12).toISOString();
}

export async function startApplicationDraft(formData: FormData) {
  const { supabase, user } = await requireFullUser();
  const grantId = getFormString(formData, "grantId") || null;
  const grantTitle = getFormString(formData, "grantTitle") || null;
  const grantFunder = getFormString(formData, "grantFunder") || null;
  const grantCategory = getFormString(formData, "grantCategory") || null;
  const applicationUrl = getFormString(formData, "applicationUrl") || null;
  const title = grantTitle ? `${grantTitle} Application` : "Untitled Application";

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      grant_id: grantId,
      grant_title: grantTitle,
      grant_funder: grantFunder,
      grant_category: grantCategory,
      application_url: applicationUrl,
      title,
      status: "drafting",
      progress: 35,
      draft_content: buildDefaultDraftSections(grantTitle) as unknown as Json,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");

  redirect(`/applications/builder/draft?id=${data.id}`);
}

export async function saveApplicationDraft(input: {
  id: string;
  title: string;
  sections: DraftSection[];
}): Promise<ApplicationActionResult> {
  const { supabase, user } = await requireFullUser();
  const title = input.title.trim() || "Untitled Application";
  const sections = input.sections
    .map((section) => ({
      title: section.title.trim(),
      body: section.body.trim(),
    }))
    .filter((section) => section.title && section.body);

  const { error } = await supabase
    .from("applications")
    .update({
      title,
      draft_content: sections as unknown as Json,
      last_updated_at: new Date().toISOString(),
      progress: 60,
    })
    .eq("user_id", user.id)
    .eq("id", input.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${input.id}`);
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateApplicationStatus(formData: FormData) {
  const { supabase, user } = await requireFullUser();
  const id = getFormString(formData, "applicationId");
  const title = getFormString(formData, "title") || "Untitled Application";
  const status = normalizeStatus(getFormString(formData, "status"));
  const statusDate = parseDateInput(getFormString(formData, "statusDate"));
  const nextDate = parseDateInput(getFormString(formData, "nextDate"));
  const amount = getFormString(formData, "amount") || null;
  const statusNote = getFormString(formData, "statusNote") || null;

  if (!id) {
    throw new Error("Missing application.");
  }

  const update: ApplicationUpdate = {
    title,
    status,
    amount,
    status_note: statusNote,
    progress: status === "drafting" ? 60 : 100,
  };

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
    throw new Error(error.message);
  }

  revalidatePath("/applications");
  revalidatePath(`/applications/${id}`);
  revalidatePath(`/applications/status/${id}`);
  revalidatePath("/dashboard");

  redirect(`/applications/${id}`);
}
