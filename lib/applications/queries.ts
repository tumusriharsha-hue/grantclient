import { createClient } from "@/lib/supabase/server";
import type { Application, ApplicationStatus } from "@/types/database";

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
