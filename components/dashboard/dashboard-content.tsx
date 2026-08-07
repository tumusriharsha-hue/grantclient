"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, ExternalLink, PenLine } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { refreshGrantExplanations } from "@/app/actions/ai";
import {
  Badge,
  Button,
  Card,
  getDeadlineVariant,
  MatchScore,
  PageContainer,
  PageHeading,
  SectionHeading,
} from "@/components/ui";
import { getStateLabel } from "@/lib/onboarding/us-states";
import type { RecommendedGrant } from "@/lib/grants/matching-types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/database";
import { calculateFundingFit, calculatePopulationFit } from "@/lib/grants/fit";
import { getDesiredFundingRange, getGrantAwardRange } from "@/lib/grants/filter-grants";
import { syncTopGrantNotifications } from "@/lib/notifications/top-grant-notifications";

type AppTab = "all" | "drafting" | "submitted" | "approved" | "rejected";
type DashboardApplicationStatus = "Drafting" | "Submitted" | "Approved" | "Rejected";

export interface DashboardApplicationItem {
  id: string;
  title: string;
  status: DashboardApplicationStatus;
  detail: string;
  amount?: string;
}

const statusStyles: Record<string, string> = {
  Drafting: "bg-gray-100 text-text-secondary",
  Submitted: "bg-primary-light text-primary-hover",
  Approved: "bg-success-light text-success-dark",
  Rejected: "bg-danger-light text-danger-dark",
};

const scoreComponentLabels: Record<string, string> = {
  focusArea: "Focus area",
  population: "Population served",
  geography: "Geography",
  fundingRange: "Funding range",
  missionAlignment: "Mission alignment",
  organizationFit: "Organization fit",
  eligibilityConfidence: "Eligibility confidence",
  deadlinePracticality: "Deadline practicality",
};

function componentLabel(key: string) {
  return scoreComponentLabels[key] ?? key;
}

function formatAwardRange(grant: RecommendedGrant) {
  const min = grant.awardMin ?? grant.amount;
  const max = grant.awardMax ?? grant.amount;
  if (min === undefined && max === undefined) return "Amount varies";
  if (min !== undefined && max !== undefined && min !== max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }
  return formatCurrency(min ?? max ?? 0);
}

const populationFitLabels = {
  strong_match: "Direct match",
  partial_match: "Partial match",
  general: "Broad eligibility",
  mismatch: "No direct match",
  unknown: "More information needed",
} as const;

const fundingFitLabels = {
  within_range: "Within your range",
  partial_overlap: "Partial overlap",
  below_range: "Below your range",
  above_range: "Above your range",
  unknown: "More information needed",
} as const;

function formatPreferredFundingRange(range: { min: number | null; max: number | null }) {
  if (range.min !== null && range.max !== null) {
    return `${formatCurrency(range.min)}–${formatCurrency(range.max)}`;
  }
  if (range.min !== null) return `${formatCurrency(range.min)} or more`;
  if (range.max !== null) return `Up to ${formatCurrency(range.max)}`;
  return "Not added yet";
}

interface DashboardContentProps {
  loginSessionKey: string;
  organization: Organization;
  recommendedGrants: RecommendedGrant[];
  applications: DashboardApplicationItem[];
}

const applicationRowClass =
  "flex min-h-[82px] min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between";
const applicationContentClass = "flex min-h-[54px] min-w-0 flex-1 flex-col";
const applicationTitleStatusClass = "min-h-[42px]";
const applicationDetailsClass = "mt-1 min-h-[24px] space-y-1";
const centeredApplicationDetailsClass =
  "mt-1 flex min-h-[24px] flex-1 items-center";
const applicationActionsClass =
  "flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:min-w-[132px] sm:self-center sm:flex-row md:flex-col lg:flex-row";
const applicationActionButtonClass =
  "w-full whitespace-normal break-words sm:whitespace-nowrap";

export function DashboardContent({
  loginSessionKey,
  organization,
  recommendedGrants,
  applications,
}: DashboardContentProps) {
  const router = useRouter();
  const [appTab, setAppTab] = useState<AppTab>("all");
  const [explanationMessage, setExplanationMessage] = useState<string | null>(null);
  const [isRefreshingExplanations, startExplanationRefresh] = useTransition();

  useEffect(() => {
    if (recommendedGrants.length === 0) return;

    const refreshKey = `grantclient:dashboard-ai:${organization.user_id}:${loginSessionKey}`;
    if (window.sessionStorage.getItem(refreshKey)) return;

    window.sessionStorage.setItem(refreshKey, "started");
    startExplanationRefresh(async () => {
      const result = await refreshGrantExplanations();
      if (!result.success) {
        window.sessionStorage.removeItem(refreshKey);
        setExplanationMessage(result.error);
        return;
      }
      window.sessionStorage.setItem(refreshKey, "completed");
      router.refresh();
    });
  }, [
    loginSessionKey,
    organization.user_id,
    recommendedGrants.length,
    router,
  ]);

  useEffect(() => {
    syncTopGrantNotifications(
      organization.user_id,
      recommendedGrants.map((grant) => ({
        id: grant.id,
        title: grant.title,
      })),
    );
  }, [organization.user_id, recommendedGrants]);

  const focusLabel =
    organization.mission_categories?.join(", ") ??
    organization.keywords?.join(", ") ??
    "your focus areas";

  const locationLabel = organization.state
    ? `${organization.city ? `${organization.city}, ` : ""}${getStateLabel(organization.state)}`
    : organization.location ?? "your area";

  const tabs: { id: AppTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "drafting", label: "Drafting" },
    { id: "submitted", label: "Submitted" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ];

  const draftingApplications = applications.filter((item) => item.status === "Drafting");
  const submittedApplications = applications.filter((item) => item.status === "Submitted");
  const approvedApplications = applications.filter((item) => item.status === "Approved");
  const rejectedApplications = applications.filter((item) => item.status === "Rejected");

  const showDrafting = appTab === "all" || appTab === "drafting";
  const showSubmitted = appTab === "all" || appTab === "submitted";
  const showApproved = appTab === "all" || appTab === "approved";
  const showRejected = appTab === "all" || appTab === "rejected";
  const visibleApplicationCount =
    (showDrafting ? draftingApplications.length : 0) +
    (showSubmitted ? submittedApplications.length : 0) +
    (showApproved ? approvedApplications.length : 0) +
    (showRejected ? rejectedApplications.length : 0);

  return (
    <PageContainer size="xl" className="space-y-12 py-8 sm:py-10 lg:py-12">
      <PageHeading
        eyebrow="Organization dashboard"
        title={`Welcome, ${organization.organization_name}`}
        description={<>Recommendations based on {focusLabel} in {locationLabel}.</>}
        actions={
          <Link href="/grants">
            <Button>
              Find grants
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <section aria-labelledby="recommended-grants-heading">
        <SectionHeading
          eyebrow="Recommended opportunities"
          title={<span id="recommended-grants-heading">Top grants for you</span>}
          description={`Personalized recommendations for ${organization.organization_name}`}
          action={
            <Link href="/grants" className="text-sm font-medium text-primary hover:underline">
              View all grants
            </Link>
          }
        />
        {isRefreshingExplanations && (
          <p className="mb-4 text-sm text-text-muted">
            Updating grant explanations…
          </p>
        )}
        {explanationMessage && (
          <p className="mb-4 text-sm text-text-secondary">{explanationMessage}</p>
        )}
        {recommendedGrants.length === 0 ? (
          <Card padding="lg">
            <p className="text-sm text-text-secondary">
              No matching grants found with your current preferences. Try updating your
              profile in{" "}
              <Link href="/settings" className="font-medium text-primary hover:underline">
                Settings
              </Link>
              .
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {recommendedGrants.map((grant) => (
              <Card key={grant.id} hover padding="md" className="flex flex-col">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <MatchScore score={grant.totalScore} size="sm" />
                  {grant.eligibilityStatus !== "needs_verification" && (
                    <Badge
                      variant={grant.eligibilityStatus === "eligible" ? "success" : "warning"}
                      className="text-right"
                    >
                      {grant.eligibilityStatus.replaceAll("_", " ")}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-text">{grant.title}</h3>
                <p className="text-sm text-text-secondary">{grant.funder}</p>
                <p className="mt-2 text-sm font-medium">
                  {formatAwardRange(grant)}
                </p>
                <Badge
                  variant={getDeadlineVariant(grant.daysUntilDeadline ?? 999)}
                  className="mt-2 w-fit"
                >
                  {grant.deadlineLabel}
                </Badge>
                <div className="mt-3 flex flex-1 flex-col gap-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Why it fits
                  </p>
                  {grant.explanation?.summary && (
                    <p className="text-sm text-text-secondary">
                      {grant.explanation.summary}
                    </p>
                  )}
                  <ul className="list-disc space-y-1 pl-4 text-sm text-text-secondary">
                    {(grant.explanation?.strengths ?? grant.factualFitReasons)
                      .slice(0, 3)
                      .map((reason) => (
                      <li key={reason}>{reason}</li>
                      ))}
                  </ul>
                  <a
                    href={grant.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Apply on funder site
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <details className="group mt-4 border-t border-border pt-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-text-secondary">
                    Why this score
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <dl className="mt-3 space-y-1.5 text-xs text-text-secondary">
                    {Object.entries(grant.components).map(([key, item]) => (
                      <div key={key} className="flex justify-between gap-3">
                        <dt>{componentLabel(key)}</dt>
                        <dd className="font-medium text-text">{item.score}/{item.maxScore}</dd>
                      </div>
                    ))}
                  </dl>
                  {(() => {
                    const populationFit = calculatePopulationFit(organization.populations_served ?? [], grant.populationsServed ?? []);
                    const preferredFundingRange = getDesiredFundingRange(organization);
                    const fundingFit = calculateFundingFit(preferredFundingRange, getGrantAwardRange(grant));
                    const needsPopulationDetails = (organization.populations_served ?? []).length === 0;
                    const needsFundingDetails = preferredFundingRange.min === null && preferredFundingRange.max === null;
                    return (
                      <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs text-text-secondary">
                        <div>
                          <p className="font-semibold text-text">Population alignment — {populationFitLabels[populationFit.status]}</p>
                          <p>Your organization serves: {(organization.populations_served ?? []).join(", ") || "Not added yet"}</p>
                          <p>This grant supports: {(grant.populationsServed ?? []).join(", ") || "A broad community; no specific population listed"}</p>
                          <p>{populationFit.explanation}</p>
                          {needsPopulationDetails && (
                            <Link href="/settings" className="font-medium text-primary hover:underline">
                              Add populations served in Settings
                            </Link>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-text">Funding alignment — {fundingFitLabels[fundingFit.status]}</p>
                          <p>Your preferred request: {formatPreferredFundingRange(preferredFundingRange)}</p>
                          <p>Grant award: {formatAwardRange(grant)}</p>
                          <p>{fundingFit.status === "unknown" ? "There is not enough information to compare the funding amounts yet." : fundingFit.explanation}</p>
                          {needsFundingDetails && (
                            <Link href="/settings" className="font-medium text-primary hover:underline">
                              Add your preferred funding range in Settings
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  <p className="mt-3 text-xs text-text-muted">
                    Estimated fit based on profile and grant facts. Funding is not guaranteed.
                  </p>
                </details>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row md:flex-col xl:flex-row">
                  <Link href={`/grants/${grant.id}`} className="sm:flex-[0.85] md:flex-none xl:flex-[0.85]">
                    <Button variant="secondary" size="sm" className="w-full whitespace-nowrap">
                      View Details
                    </Button>
                  </Link>
                  <Link
                    href={`/applications/builder?grant=${encodeURIComponent(grant.id)}`}
                    className="sm:flex-[1.15] md:flex-none xl:flex-[1.15]"
                  >
                    <Button size="sm" className="w-full whitespace-nowrap">
                      Start Application
                      <PenLine className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card padding="lg" className="border-primary/20 bg-primary-light/20 p-7 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 grow-0 basis-12 items-center justify-center rounded-lg bg-primary text-white">
              <PenLine className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text">Drafting Lab</h2>
              <p className="text-sm text-text-secondary">
                Use AI to draft your next grant application in minutes, not hours.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end md:items-stretch lg:items-end">
            <Link href="/applications/builder">
              <Button className="w-full whitespace-nowrap">
                Start Drafting
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="/applications"
              className="text-center text-sm text-text-muted hover:text-primary hover:underline sm:text-right md:text-center lg:text-right"
            >
              View Recent Drafts
            </Link>
          </div>
        </div>
      </Card>

      <section aria-labelledby="applications-heading">
        <SectionHeading
          eyebrow="Application pipeline"
          title={<span id="applications-heading">Your applications</span>}
          description="Review drafts, submitted applications, and decisions in one place."
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAppTab(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                appTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-surface text-text-secondary hover:bg-bg",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {visibleApplicationCount === 0 && (
            <Card padding="md">
              <p className="text-sm text-text-secondary">
                No applications in this category yet. Start one from the{" "}
                <Link
                  href="/applications/builder"
                  className="font-medium text-primary hover:underline"
                >
                  Drafting Lab
                </Link>{" "}
                or choose a grant from{" "}
                <Link
                  href="/grants"
                  className="font-medium text-primary hover:underline"
                >
                  Grant Finder
                </Link>
                .
              </p>
            </Card>
          )}

          {showDrafting && draftingApplications.length > 0 && (
            <div className="space-y-3">
              {draftingApplications.map((item) => (
                <Card key={item.id} padding="md">
                  <div className={applicationRowClass}>
                    <div className={applicationContentClass}>
                      <div className={applicationTitleStatusClass}>
                        <h4 className="font-semibold text-text">{item.title}</h4>
                        <span
                          className={cn(
                            "mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase",
                            statusStyles.Drafting,
                          )}
                        >
                          Drafting
                        </span>
                      </div>
                      <div className={centeredApplicationDetailsClass}>
                        <p className="text-xs text-text-muted">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <div className={applicationActionsClass}>
                      <Link href={`/applications/${item.id}`}>
                        <Button variant="secondary" size="sm" className={applicationActionButtonClass}>
                          View Application
                        </Button>
                      </Link>
                      <Link href={`/applications/status/${item.id}`}>
                        <Button variant="ghost" size="sm" className={applicationActionButtonClass}>
                          Update Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {showSubmitted && submittedApplications.length > 0 && (
            <div className="space-y-3">
              {submittedApplications.map((item) => (
                <Card key={item.id} padding="md">
                  <div className={applicationRowClass}>
                    <div className={applicationContentClass}>
                      <div className={applicationTitleStatusClass}>
                        <h4 className="font-semibold text-text">{item.title}</h4>
                        <span
                          className={cn(
                            "mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase",
                            statusStyles.Submitted,
                          )}
                        >
                          Submitted
                        </span>
                      </div>
                      <div className={centeredApplicationDetailsClass}>
                        <p className="text-xs text-text-muted">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <div className={applicationActionsClass}>
                      <Link href={`/applications/${item.id}`}>
                        <Button variant="secondary" size="sm" className={applicationActionButtonClass}>
                          View Application
                        </Button>
                      </Link>
                      <Link href={`/applications/status/${item.id}`}>
                        <Button variant="ghost" size="sm" className={applicationActionButtonClass}>
                          Update Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {showApproved && approvedApplications.length > 0 && (
            <div className="space-y-3">
              {approvedApplications.map((item) => (
                <Card key={item.id} padding="md">
                  <div className={applicationRowClass}>
                    <div className={applicationContentClass}>
                      <div className={applicationTitleStatusClass}>
                        <h4 className="font-semibold text-text">{item.title}</h4>
                        <span
                          className={cn(
                            "mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase",
                            statusStyles.Approved,
                          )}
                        >
                          Approved
                        </span>
                      </div>
                      <div className={applicationDetailsClass}>
                        <p className="text-xs text-success-dark">{item.amount}</p>
                        <p className="text-xs text-text-muted">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <div className={applicationActionsClass}>
                      <Link href={`/applications/${item.id}`}>
                        <Button variant="secondary" size="sm" className={applicationActionButtonClass}>
                          View Application
                        </Button>
                      </Link>
                      <Link href={`/applications/status/${item.id}`}>
                        <Button variant="ghost" size="sm" className={applicationActionButtonClass}>
                          Update Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {showRejected && rejectedApplications.length > 0 && (
            <div className="space-y-3">
              {rejectedApplications.map((item) => (
                <Card key={item.id} padding="md">
                  <div className={applicationRowClass}>
                    <div className={applicationContentClass}>
                      <div className={applicationTitleStatusClass}>
                        <h4 className="font-semibold text-text">{item.title}</h4>
                        <span
                          className={cn(
                            "mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase",
                            statusStyles.Rejected,
                          )}
                        >
                          Rejected
                        </span>
                      </div>
                      <div className={centeredApplicationDetailsClass}>
                        <p className="text-xs text-text-muted">
                          {item.detail}
                        </p>
                      </div>
                    </div>
                    <div className={applicationActionsClass}>
                      <Link href={`/applications/${item.id}`}>
                        <Button variant="secondary" size="sm" className={applicationActionButtonClass}>
                          View Application
                        </Button>
                      </Link>
                      <Link href={`/applications/status/${item.id}`}>
                        <Button variant="ghost" size="sm" className={applicationActionButtonClass}>
                          Update Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
