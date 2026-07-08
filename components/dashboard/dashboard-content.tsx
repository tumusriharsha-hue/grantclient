"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, Lightbulb, PenLine } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  getDeadlineVariant,
  MatchScore,
} from "@/components/ui";
import { getStateLabel } from "@/lib/onboarding/us-states";
import { getTopMatchedGrants } from "@/lib/grant-matching";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/database";
import type { Grant } from "@/types/grant";

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

interface DashboardContentProps {
  organization: Organization;
  grants: Grant[];
  applications: DashboardApplicationItem[];
}

const applicationRowClass =
  "flex min-h-[82px] flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between";
const applicationContentClass = "flex min-h-[54px] flex-col";
const applicationTitleStatusClass = "min-h-[42px]";
const applicationDetailsClass = "mt-1 min-h-[24px] space-y-1";
const centeredApplicationDetailsClass =
  "mt-1 flex min-h-[24px] flex-1 items-center";
const applicationActionsClass =
  "flex min-w-[132px] flex-col gap-2 sm:self-center sm:flex-row md:flex-col lg:flex-row";

export function DashboardContent({
  organization,
  grants,
  applications,
}: DashboardContentProps) {
  const [appTab, setAppTab] = useState<AppTab>("all");

  const recommendedGrants = useMemo(
    () => getTopMatchedGrants(grants, organization, 3),
    [grants, organization],
  );

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
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-text">
          Welcome, {organization.organization_name}
        </h1>
        <p className="mt-1 text-text-secondary">
          Based on {focusLabel} in {locationLabel}.
        </p>
      </div>

      <section>
        <h2 className="mb-1 text-xl font-bold text-text">Top Grants for You</h2>
        <p className="mb-4 text-sm text-text-secondary">
          Personalized recommendations for {organization.organization_name}
        </p>
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendedGrants.map((grant) => (
              <Card key={grant.id} hover padding="md" className="flex flex-col">
                <MatchScore score={grant.matchScore} size="sm" className="mb-4" />
                <h3 className="font-semibold text-text">{grant.title}</h3>
                <p className="text-sm text-text-secondary">{grant.funder}</p>
                <p className="mt-2 text-sm font-medium">
                  {grant.amount ? formatCurrency(grant.amount) : "Amount varies"}
                </p>
                <Badge variant={getDeadlineVariant(grant.daysLeft)} className="mt-2 w-fit">
                  {grant.deadlineLabel}
                </Badge>
                <div className="mt-3 flex flex-1 flex-col gap-1.5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Lightbulb className="h-3.5 w-3.5" />
                    AI tips
                  </p>
                  <p className="text-sm italic text-text-secondary">
                    &ldquo;{grant.matchReasons[0] ?? "Strong fit based on your organization profile."}&rdquo;
                  </p>
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
                      Draft application
                      <PenLine className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Card padding="lg" className="border-primary/20 bg-primary-light/10">
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

      <section>
        <h2 className="mb-4 text-xl font-bold text-text">Your Applications</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAppTab(tab.id)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
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
                No applications in this category yet. Start one from the Drafting Lab
                or choose a grant from Grant Finder.
              </p>
            </Card>
          )}

          {showDrafting && draftingApplications.length > 0 && (
            <div className="space-y-3">
              {appTab === "all" && (
                <h3 className="text-sm font-semibold text-text-secondary">Drafting</h3>
              )}
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
                        <Button variant="secondary" size="sm" className="w-full whitespace-nowrap">
                          View Application
                        </Button>
                      </Link>
                      <Link href={`/applications/status/${item.id}`}>
                        <Button variant="ghost" size="sm" className="w-full whitespace-nowrap">
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
              {appTab === "all" && (
                <h3 className="text-sm font-semibold text-text-secondary">Submitted</h3>
              )}
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
                        <Button variant="secondary" size="sm" className="w-full whitespace-nowrap">
                          View Application
                        </Button>
                      </Link>
                      <Link href={`/applications/status/${item.id}`}>
                        <Button variant="ghost" size="sm" className="w-full whitespace-nowrap">
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
              {appTab === "all" && (
                <h3 className="text-sm font-semibold text-text-secondary">Approved</h3>
              )}
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
                        <Button variant="secondary" size="sm" className="w-full whitespace-nowrap">
                          View Application
                        </Button>
                      </Link>
                      <Link href={`/applications/status/${item.id}`}>
                        <Button variant="ghost" size="sm" className="w-full whitespace-nowrap">
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
              {appTab === "all" && (
                <h3 className="text-sm font-semibold text-text-secondary">Rejected</h3>
              )}
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
                        <Button variant="secondary" size="sm" className="w-full whitespace-nowrap">
                          View Application
                        </Button>
                      </Link>
                      <Link href={`/applications/status/${item.id}`}>
                        <Button variant="ghost" size="sm" className="w-full whitespace-nowrap">
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
    </div>
  );
}
