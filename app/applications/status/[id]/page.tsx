import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { applicationStatus } from "@/data";
import { ApplicationStatusEditor } from "@/components/applications/application-status-editor";
import { AppHeader, AppShell } from "@/components/layout";

interface ApplicationStatusRouteProps {
  params: Promise<{ id: string }>;
}

type ApplicationStatusLabel = "Drafting" | "Submitted" | "Approved" | "Rejected";

interface DashboardApplication {
  id: string;
  title: string;
  status: ApplicationStatusLabel;
  href?: string;
  lastUpdated?: string;
  submissionDate?: string;
  decisionDate?: string;
  statusNote?: string;
  amount?: string;
}

function getDashboardApplications(): DashboardApplication[] {
  return [
    ...applicationStatus.drafting.items.map((item) => ({
      ...item,
      status: "Drafting" as const,
    })),
    ...applicationStatus.submitted.items.map((item) => ({
      ...item,
      status: "Submitted" as const,
    })),
    ...applicationStatus.outcomes.items.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.outcome as ApplicationStatusLabel,
      submissionDate: item.submissionDate,
      decisionDate: item.decisionDate,
      amount: "amount" in item ? item.amount : undefined,
    })),
  ];
}

function getInitialStatusDate(application: DashboardApplication) {
  if (application.status === "Drafting") {
    return application.lastUpdated;
  }

  return application.submissionDate;
}

function getApplicationById(id: string): DashboardApplication | undefined {
  return getDashboardApplications().find((application) => application.id === id);
}

export async function generateMetadata({
  params,
}: ApplicationStatusRouteProps): Promise<Metadata> {
  const { id } = await params;
  const application = getApplicationById(id);

  return {
    title: application ? `Update ${application.title}` : "Update Application Status",
  };
}

export default async function ApplicationStatusPage({
  params,
}: ApplicationStatusRouteProps) {
  const { id } = await params;
  const application = getApplicationById(id);

  if (!application) {
    notFound();
  }

  return (
    <AppShell header={<AppHeader showSearch={false} title="Update Status" />}>
      <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <ApplicationStatusEditor
          title={application.title}
          initialStatus={application.status.toLowerCase() as Lowercase<ApplicationStatusLabel>}
          initialStatusDate={getInitialStatusDate(application)}
          initialDecisionDate={application.decisionDate}
          amount={application.amount}
          note={application.statusNote}
        />
      </div>
    </AppShell>
  );
}
