"use client";

import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { PublicNav } from "@/components/marketing/public-nav";
import { GrantBrowserCard } from "@/components/grants/grant-browser-card";
import { Button, Card } from "@/components/ui";
import { filterAndSortGrants, scoreGrant } from "@/lib/grant-matching";
import type { Grant } from "@/types/grant";

interface BrowseGrantsPageProps {
  grants: Grant[];
}

export function BrowseGrantsPage({ grants }: BrowseGrantsPageProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const scoredGrants = useMemo(
    () => grants.map((grant) => scoreGrant(grant, null)),
    [grants],
  );

  const filtered = useMemo(
    () =>
      filterAndSortGrants(scoredGrants, {
        search,
        category: "all",
        amountRange: "any",
        deadlineRange: "any",
        sort: "deadline",
      }),
    [scoredGrants, search],
  );

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav showSignIn />

      <div className="border-b border-border bg-surface px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grants by keyword…"
            className="flex-1 rounded-md border border-border bg-bg px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          />
          <Button
            variant="secondary"
            onClick={() => setShowFilters((v) => !v)}
            className="shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-8 p-6 md:p-8">
        <aside
          className={`${showFilters ? "block" : "hidden"} w-full shrink-0 space-y-4 md:block md:w-64`}
        >
          <Card padding="md">
            <h3 className="mb-2 text-sm font-semibold text-text">Public preview</h3>
            <p className="text-sm text-text-secondary">
              Browse {grants.length} open grants. Create a free account for personalized
              matching and saved grants.
            </p>
            <Link href="/auth/signup" className="mt-4 inline-flex">
              <Button size="sm">
                Sign Up Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-text-secondary">
            Showing {filtered.length} of {grants.length} grants
          </p>
          <div className="space-y-4">
            {filtered.map((grant) => (
              <GrantBrowserCard
                key={grant.id}
                grant={grant}
                saved={false}
                onToggleSave={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
