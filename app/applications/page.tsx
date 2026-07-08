import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, FileText, PenLine } from "lucide-react";
import { AppHeader, AppShell } from "@/components/layout";
import { SectionJumpLink } from "@/components/applications";
import { Badge, Button, Card } from "@/components/ui";
import {
  getDecisionLabel,
  getLastUpdatedLabel,
  getSubmittedLabel,
} from "@/lib/applications/date-labels";
import {
  getApplicationProgress,
  getApplicationStatusLabel,
  getCurrentUserApplications,
} from "@/lib/applications/queries";

export const metadata: Metadata = {
  title: "My Applications",
};

type ApplicationStatusLabel = "Drafting" | "Submitted" | "Approved" | "Rejected";

const statusVariant: Record<ApplicationStatusLabel, "default" | "success" | "danger" | "neutral"> = {
  Drafting: "neutral",
  Submitted: "default",
  Approved: "success",
  Rejected: "danger",
};

const statusCopy: Record<ApplicationStatusLabel, string> = {
  Drafting: "Applications still being prepared.",
  Submitted: "Applications awaiting a decision.",
  Approved: "Awarded applications and funding outcomes.",
  Rejected: "Applications that need review or follow-up.",
};

const statusSectionIds: Record<ApplicationStatusLabel, string> = {
  Drafting: "drafting-applications",
  Submitted: "submitted-applications",
  Approved: "approved-applications",
  Rejected: "rejected-applications",
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

export default async function ApplicationsPage() {
  const applications = (await getCurrentUserApplications()).map((application) => {
    const status = getApplicationStatusLabel(application.status) as ApplicationStatusLabel;

    return {
      id: application.id,
      title: application.title,
      status,
      detail: getApplicationDetail(application),
      summary:
        application.status_note ??
        application.grant_title ??
        "Application record saved to your account.",
      amount: application.amount ?? undefined,
      progress: getApplicationProgress(
        application.status as "drafting" | "submitted" | "approved" | "rejected",
        application.progress,
      ),
    };
  });
  const groupedApplications = (
    ["Drafting", "Submitted", "Approved", "Rejected"] as const
  ).map((status) => ({
    status,
    items: applications.filter((application) => application.status === status),
  }));

  return (
    <AppShell header={<AppHeader showSearch={false} title="My Applications" />}>
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">My Applications</h1>
            <p className="mt-1 text-text-secondary">
              Track drafts, submissions, and funding decisions in one place.
            </p>
          </div>
          <Link href="/applications/builder" className="w-full sm:w-auto">
            <Button className="w-full whitespace-nowrap sm:w-auto">
              New Application
              <PenLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {groupedApplications.map(({ status, items }) => (
            <SectionJumpLink
              key={status}
              targetId={statusSectionIds[status]}
              className="block h-full rounded-lg focus:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/10"
            >
              <Card hover padding="md" className="h-full">
                <div className="flex h-full items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{status}</p>
                    <p className="mt-1 text-xs text-text-muted">{statusCopy[status]}</p>
                  </div>
                  <Badge variant={statusVariant[status]}>{items.length}</Badge>
                </div>
              </Card>
            </SectionJumpLink>
          ))}
        </div>

        <div className="space-y-6">
          {groupedApplications.map(({ status, items }) => (
            <section
              key={status}
              id={statusSectionIds[status]}
              className="scroll-mt-24 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-text">{status}</h2>
                  <p className="text-sm text-text-secondary">{statusCopy[status]}</p>
                </div>
                <Badge variant={statusVariant[status]}>{items.length}</Badge>
              </div>

              {items.length === 0 ? (
                <Card padding="md">
                  <p className="text-sm text-text-secondary">
                    No {status.toLowerCase()} applications yet.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {items.map((application) => (
                    <Card key={application.id} hover padding="md" className="overflow-hidden">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusVariant[application.status]}>
                              {application.status}
                            </Badge>
                            <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                              <Clock3 className="h-3.5 w-3.5" />
                              {application.detail}
                            </span>
                            {application.amount && (
                              <span className="text-xs font-medium text-success-dark">
                                {application.amount}
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 break-words font-semibold text-text">
                            {application.title}
                          </h3>
                          {application.summary && (
                            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                              {application.summary}
                            </p>
                          )}

                          {application.progress !== undefined && (
                            <div className="mt-3 w-full">
                              <div className="flex items-center justify-between text-xs font-medium text-text-muted">
                                <span>
                                  {application.status === "Drafting"
                                    ? "Draft progress"
                                    : "Application progress"}
                                </span>
                                <span>{application.progress}%</span>
                              </div>
                              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${application.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-[170px] flex-col gap-2 sm:flex-row lg:flex-col">
                          <Link href={`/applications/${application.id}`} className="w-full">
                            <Button variant="secondary" size="sm" className="w-full">
                              <FileText className="h-4 w-4" />
                              View Application
                            </Button>
                          </Link>
                          {application.status === "Drafting" ? (
                            <Link
                              href={`/applications/builder/draft?id=${application.id}`}
                              className="w-full"
                            >
                              <Button size="sm" className="w-full">
                                Continue editing
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : (
                            <Link
                              href={`/applications/status/${application.id}`}
                              className="w-full"
                            >
                              <Button variant="ghost" size="sm" className="w-full">
                                Update Status
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
