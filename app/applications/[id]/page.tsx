import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, PenLine } from "lucide-react";
import { AppHeader, AppShell } from "@/components/layout";
import { Badge, Button, Card } from "@/components/ui";
import { normalizeDraftSections } from "@/lib/applications/defaults";
import {
  getApplicationProgress,
  getApplicationStatusLabel,
  getCurrentUserApplicationById,
} from "@/lib/applications/queries";
import {
  getDecisionLabel,
  getLastUpdatedLabel,
  getSubmittedLabel,
} from "@/lib/applications/date-labels";

interface ApplicationRouteProps {
  params: Promise<{ id: string }>;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "submitted":
      return "default";
    case "drafting":
    default:
      return "neutral";
  }
}

function getDateLabel(application: {
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

export async function generateMetadata({
  params,
}: ApplicationRouteProps): Promise<Metadata> {
  const { id } = await params;
  const application = await getCurrentUserApplicationById(id);

  return {
    title: application ? `View ${application.title}` : "View Application",
  };
}

export default async function ApplicationPage({ params }: ApplicationRouteProps) {
  const { id } = await params;
  const application = await getCurrentUserApplicationById(id);

  if (!application) {
    notFound();
  }

  const statusLabel = getApplicationStatusLabel(application.status);
  const sections = normalizeDraftSections(application.draft_content);
  const progress = getApplicationProgress(
    application.status as "drafting" | "submitted" | "approved" | "rejected",
    application.progress,
  );

  return (
    <AppShell header={<AppHeader showSearch={false} title="View Application" />}>
      <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
        <Link
          href="/applications"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Link>

        <Card padding="lg">
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={getStatusBadgeVariant(application.status)}>
                  {statusLabel}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {getDateLabel(application)}
                </span>
                {application.amount && (
                  <span className="text-xs font-medium text-success-dark">
                    {application.amount}
                  </span>
                )}
              </div>
              <h1 className="break-words text-2xl font-bold text-text">
                {application.title}
              </h1>
              {(application.grant_title || application.grant_funder) && (
                <p className="mt-1 text-sm text-text-secondary">
                  {[application.grant_title, application.grant_funder]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
            <div className="w-full shrink-0 sm:w-48">
              <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                <span>
                  {application.status === "drafting"
                    ? "Draft progress"
                    : "Application progress"}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 pt-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Application summary
                </h2>
                <p className="mt-2 leading-relaxed text-text-secondary">
                  {application.status_note ??
                    "Application record saved to your account."}
                </p>
              </div>

              <div className="space-y-3">
                {sections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-md border border-border bg-bg p-4"
                  >
                    <h3 className="font-semibold text-text">{section.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <Card padding="md" className="bg-primary-light/20">
                <div className="flex gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="font-semibold text-text">Application actions</h2>
                    <p className="mt-1 text-sm text-text-secondary">
                      Edit this draft or update its pipeline status.
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {application.status === "drafting" && (
                    <Link
                      href={`/applications/builder/draft?id=${application.id}`}
                      className="block"
                    >
                      <Button className="w-full">
                        Continue editing
                        <PenLine className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href={`/applications/status/${application.id}`} className="block">
                    <Button variant="secondary" className="w-full">
                      Update status
                    </Button>
                  </Link>
                  {application.application_url && (
                    <a
                      href={application.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button type="button" variant="ghost" className="w-full">
                        Open funder site
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            </aside>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
