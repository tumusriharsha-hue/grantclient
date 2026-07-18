import { createClient } from "@/lib/supabase/server";
import type { Application, ApplicationStatus } from "@/types/database";
import type { DraftSection } from "@/lib/applications/defaults";
import { proposalTemplate } from "@/lib/applications/proposal-template";

const applicationSelect = "*";

export async function getCurrentUserApplications(): Promise<Application[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return [];
  }

  const { data, error } = await supabase
    .from("applications")
    .select(applicationSelect)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load applications: ${error.message}`);
  }

  return data ?? [];
}

export async function getCurrentUserApplicationById(
  id: string,
): Promise<Application | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return null;
  }

  const { data, error } = await supabase
    .from("applications")
    .select(applicationSelect)
    .eq("user_id", user.id)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load application: ${error.message}`);
  }

  return data;
}

export async function getCurrentUserApplicationSections(
  applicationId: string,
): Promise<DraftSection[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return [];

  const { data, error } = await supabase
    .from("application_sections")
    .select("*")
    .eq("user_id", user.id)
    .eq("application_id", applicationId);

  if (error) {
    // Older deployments store sections in applications.draft_content only.
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }
    throw new Error("Failed to load proposal sections.");
  }

  const order = new Map(proposalTemplate.map((section) => [section.id, section.order]));
  return (data ?? [])
    .map((section) => ({
      id: section.id,
      sectionKey: section.section_key,
      title: section.title,
      body: section.content,
      status: section.status as DraftSection["status"],
      previousBody: section.previous_content,
      missingInformation: Array.isArray(section.missing_information)
        ? section.missing_information.filter((item): item is string => typeof item === "string")
        : [],
      usedSourceFields: Array.isArray(section.used_source_fields)
        ? section.used_source_fields.filter((item): item is string => typeof item === "string")
        : [],
    }))
    .sort((left, right) =>
      (order.get(left.sectionKey ?? "") ?? 999) - (order.get(right.sectionKey ?? "") ?? 999),
    );
}

export function getApplicationProgress(status: ApplicationStatus, progress?: number | null) {
  if (status === "drafting") {
    return progress ?? 35;
  }

  return 100;
}

export function getApplicationStatusLabel(status: string) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "drafting":
    default:
      return "Drafting";
  }
}
