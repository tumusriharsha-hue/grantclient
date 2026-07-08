import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, PenLine } from "lucide-react";
import { applicationStatus } from "@/data";
import { AppHeader, AppShell } from "@/components/layout";
import { Badge, Button, Card } from "@/components/ui";
import {
  getDecisionLabel,
  getLastUpdatedLabel,
  getSubmittedLabel,
} from "@/lib/applications/date-labels";

interface ApplicationRouteProps {
  params: Promise<{ id: string }>;
}

type ApplicationView = {
  id: string;
  title: string;
  status: "Drafting" | "Submitted" | "Approved" | "Rejected";
  dateLabel: string;
  progress?: number;
  amount?: string;
  summary: string;
};

const applicationSections = [
  {
    title: "Organization need",
    body: "Urban Reach Initiative is seeking support to expand direct services for families facing limited access to education, food security, and community-based support programs.",
  },
  {
    title: "Program approach",
    body: "The proposed program combines targeted outreach, partner referrals, and participant-centered services to increase access for underserved neighborhoods.",
  },
  {
    title: "Expected outcomes",
    body: "The application emphasizes improved service reach, stronger referral pathways, and measurable gains in participant engagement over the grant period.",
  },
];

function getApplicationById(id: string): ApplicationView | undefined {
  const draft = applicationStatus.drafting.items.find((item) => item.id === id);

  if (draft) {
    return {
      id: draft.id,
      title: draft.title,
      status: "Drafting",
      dateLabel: getLastUpdatedLabel(draft.lastUpdated),
      progress: draft.progress,
      summary: draft.summary,
    };
  }

  const submitted = applicationStatus.submitted.items.find((item) => item.id === id);

  if (submitted) {
    return {
      id: submitted.id,
      title: submitted.title,
      status: "Submitted",
      dateLabel: getSubmittedLabel(submitted.submissionDate),
      progress: 100,
      summary:
        "Submitted application package with program narrative, organization details, and requested funding information.",
    };
  }

  const outcome = applicationStatus.outcomes.items.find((item) => item.id === id);

  if (outcome) {
    const status = outcome.outcome === "Approved" ? "Approved" : "Rejected";

    return {
      id: outcome.id,
      title: outcome.title,
      status,
      dateLabel: getDecisionLabel(outcome.decisionDate),
      progress: 100,
      amount: "amount" in outcome ? outcome.amount : undefined,
      summary:
        status === "Approved"
          ? "Approved application record with decision details and award information."
          : "Application record with decision details and follow-up notes.",
    };
  }

  return undefined;
}

function getStatusBadgeVariant(status: ApplicationView["status"]) {
  switch (status) {
    case "Approved":
      return "success";
    case "Rejected":
      return "danger";
    case "Submitted":
      return "default";
    case "Drafting":
    default:
      return "neutral";
  }
}

export async function generateMetadata({
  params,
}: ApplicationRouteProps): Promise<Metadata> {
  const { id } = await params;
  const application = getApplicationById(id);

  return {
    title: application ? `View ${application.title}` : "View Application",
  };
}

export default async function ApplicationPage({ params }: ApplicationRouteProps) {
  const { id } = await params;
  const application = getApplicationById(id);

  if (!application) {
    notFound();
  }

  return (
    <AppShell header={<AppHeader showSearch={false} title="View Application" />}>
      <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <Card padding="lg">
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={getStatusBadgeVariant(application.status)}>
                  {application.status}
                </Badge>
                <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {application.dateLabel}
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
            </div>
            {application.progress !== undefined && (
              <div className="w-full shrink-0 sm:w-48">
                <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                  <span>
                    {application.status === "Drafting"
                      ? "Draft progress"
                      : "Application progress"}
                  </span>
                  <span>{application.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${application.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-6 pt-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                  Application summary
                </h2>
                <p className="mt-2 leading-relaxed text-text-secondary">
                  {application.summary}
                </p>
              </div>

              <div className="space-y-3">
                {applicationSections.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-md border border-border bg-bg p-4"
                  >
                    <h3 className="font-semibold text-text">{section.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
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
                      Review this application or update its pipeline status.
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {application.status === "Drafting" && (
                    <Link href="/applications/builder/draft" className="block">
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
                </div>
              </Card>
            </aside>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
