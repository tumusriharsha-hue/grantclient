import type { Metadata } from "next";
import { DashboardPage } from "@/components/dashboard";
import type { DashboardApplicationItem } from "@/components/dashboard/dashboard-content";
import {
  getDecisionLabel,
  getLastUpdatedLabel,
  getSubmittedLabel,
} from "@/lib/applications/date-labels";
import {
  getApplicationStatusLabel,
  getCurrentUserApplications,
} from "@/lib/applications/queries";
import { getAllGrants } from "@/lib/grants/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
};

function getApplicationDetail(application: {
  status: string;
  last_updated_at: string;
  submitted_at: string | null;
  decision_at: string | null;
}) {
  if (application.status === "drafting") {
    return getLastUpdatedLabel(application.last_updated_at);
  }

  if (application.status === "submitted") {
    return application.submitted_at
      ? getSubmittedLabel(application.submitted_at)
      : "Submission date not set";
  }

  return application.decision_at
    ? getDecisionLabel(application.decision_at)
    : "Decision date not set";
}

export default async function DashboardRoute() {
  const supabase = await createClient();
  const [grants, authResult] = await Promise.all([
    getAllGrants(),
    supabase.auth.getUser(),
  ]);

  const { data: { user } } = authResult;

  let organization = null;
  let applications: DashboardApplicationItem[] = [];

  if (user) {
    const [{ data }, userApplications] = await Promise.all([
      supabase
        .from("organizations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      getCurrentUserApplications(),
    ]);

    organization = data;
    applications = userApplications.map((application) => ({
      id: application.id,
      title: application.title,
      status: getApplicationStatusLabel(application.status) as
        | "Drafting"
        | "Submitted"
        | "Approved"
        | "Rejected",
      detail: getApplicationDetail(application),
      amount: application.amount ?? undefined,
    }));
  }

  return (
    <DashboardPage
      user={user}
      organization={organization}
      grants={grants}
      applications={applications}
    />
  );
}
