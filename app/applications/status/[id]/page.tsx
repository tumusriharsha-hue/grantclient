import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApplicationStatusEditor } from "@/components/applications/application-status-editor";
import { AppHeader, AppShell } from "@/components/layout";
import { getCurrentUserApplicationById } from "@/lib/applications/queries";
import type { ApplicationStatus } from "@/types/database";

interface ApplicationStatusRouteProps {
  params: Promise<{ id: string }>;
}

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : undefined;
}

function getInitialStatusDate(application: {
  status: string;
  last_updated_at: string;
  submitted_at: string | null;
}) {
  if (application.status === "drafting") {
    return toDateInputValue(application.last_updated_at);
  }

  return toDateInputValue(application.submitted_at);
}

export async function generateMetadata({
  params,
}: ApplicationStatusRouteProps): Promise<Metadata> {
  const { id } = await params;
  const application = await getCurrentUserApplicationById(id);

  return {
    title: application ? `Update ${application.title}` : "Update Application Status",
  };
}

export default async function ApplicationStatusPage({
  params,
}: ApplicationStatusRouteProps) {
  const { id } = await params;
  const application = await getCurrentUserApplicationById(id);

  if (!application) {
    notFound();
  }

  return (
    <AppShell header={<AppHeader showSearch={false} title="Update Status" />}>
      <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Link>

        <ApplicationStatusEditor
          applicationId={application.id}
          title={application.title}
          initialStatus={application.status as ApplicationStatus}
          initialStatusDate={getInitialStatusDate(application)}
          initialDecisionDate={toDateInputValue(application.decision_at)}
          amount={application.amount ?? undefined}
          note={application.status_note ?? undefined}
        />
      </div>
    </AppShell>
  );
}
