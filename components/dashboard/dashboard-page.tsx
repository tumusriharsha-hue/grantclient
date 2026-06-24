"use client";

import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { useState } from "react";
import {
  applicationStatus,
  orgName,
  recommendedGrants,
} from "@/data";
import { AppShell } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  getDeadlineVariant,
  MatchScore,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type AppTab = "all" | "drafting" | "submitted" | "outcomes";

const statusStyles: Record<string, string> = {
  Drafting: "bg-gray-100 text-text-secondary",
  Submitted: "bg-primary-light text-primary-hover",
  Approved: "bg-success-light text-success-dark",
  Rejected: "bg-danger-light text-danger-dark",
};

export function DashboardPage() {
  const [appTab, setAppTab] = useState<AppTab>("all");

  const tabs: { id: AppTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "drafting", label: "Drafting" },
    { id: "submitted", label: "Submitted" },
    { id: "outcomes", label: "Approved/Rejected" },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Welcome, {orgName}</h1>
          <p className="mt-1 text-text-secondary">
            Based on your organization and selected focus areas.
          </p>
        </div>

        <section>
          <h2 className="mb-1 text-xl font-bold text-text">Top Grants for You</h2>
          <p className="mb-4 text-sm text-text-secondary">
            Personalized recommendations for {orgName}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendedGrants.map((grant) => (
              <Card key={grant.id} hover padding="md" className="flex flex-col">
                <MatchScore score={grant.matchScore} size="sm" className="mb-4" />
                <h3 className="font-semibold text-text">{grant.title}</h3>
                <p className="text-sm text-text-secondary">{grant.organization}</p>
                <p className="mt-2 text-sm font-medium">{grant.amountRange}</p>
                <Badge variant={getDeadlineVariant(grant.daysLeft)} className="mt-2 w-fit">
                  Deadline: {grant.deadlineLabel ?? `${grant.daysLeft} days`}
                </Badge>
                <p className="mt-3 flex-1 text-sm italic text-text-secondary">
                  &ldquo;{grant.insight}&rdquo;
                </p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/grants/${grant.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                  <Link href="/applications/builder" className="flex-1">
                    <Button size="sm" className="w-full">
                      Draft Application
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Card padding="lg" className="border-primary/20 bg-primary-light/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                <PenLine className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Drafting Lab</h2>
                <p className="text-sm text-text-secondary">
                  Use AI to draft your next grant application in minutes, not hours.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <Link href="/applications/builder">
                <Button>
                  Start Drafting
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link
                href="/applications"
                className="text-sm text-text-muted hover:text-primary hover:underline"
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

          <div className="space-y-3">
            {applicationStatus.drafting.items.map((item) => (
              <Card key={item.id} padding="md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-text">{item.title}</h3>
                    <span
                      className={cn(
                        "mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase",
                        statusStyles.Drafting,
                      )}
                    >
                      Drafting
                    </span>
                    <p className="mt-1 text-xs text-text-muted">Last updated: Oct 5, 2024</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={item.href}>
                      <Button variant="secondary" size="sm">
                        View Draft
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      Update Status
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {applicationStatus.submitted.items.map((item) => (
              <Card key={item.id} padding="md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-text">{item.title}</h3>
                    <span
                      className={cn(
                        "mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase",
                        statusStyles.Submitted,
                      )}
                    >
                      Submitted
                    </span>
                    <p className="mt-1 text-xs text-text-muted">{item.date}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Update Status
                  </Button>
                </div>
              </Card>
            ))}

            {applicationStatus.outcomes.items.map((item) => (
              <Card key={item.id} padding="md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-text">{item.title}</h3>
                    <span
                      className={cn(
                        "mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase",
                        statusStyles.Approved,
                      )}
                    >
                      {item.outcome}
                    </span>
                    <p className="mt-1 text-xs text-success-dark">{item.amount}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
