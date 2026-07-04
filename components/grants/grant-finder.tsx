"use client";

import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AppShell } from "@/components/layout";
import { Button, Card, Select } from "@/components/ui";
import { useUser } from "@/hooks/use-user";
import {
  filterAndSortGrants,
  scoreAndFilterGrants,
  type AmountRangeFilter,
  type DeadlineRangeFilter,
  type GrantSortOption,
} from "@/lib/grant-matching";
import type { Organization } from "@/types/database";
import type { Grant } from "@/types/grant";
import { GRANT_CATEGORIES, type GrantCategory } from "@/types/grant";
import { GrantBrowserCard } from "./grant-browser-card";

const SAVED_GRANTS_KEY = "grantclient:saved-grants";
const savedGrantsListeners = new Set<() => void>();

let cachedSavedRaw: string | null = null;
let cachedSavedIds: string[] = [];

function readSavedGrantIds(): string[] {
  try {
    const stored = window.localStorage.getItem(SAVED_GRANTS_KEY);

    if (stored === cachedSavedRaw) {
      return cachedSavedIds;
    }

    cachedSavedRaw = stored;
    cachedSavedIds = stored ? (JSON.parse(stored) as string[]) : [];
    return cachedSavedIds;
  } catch {
    cachedSavedRaw = null;
    cachedSavedIds = [];
    return cachedSavedIds;
  }
}

function subscribeSavedGrants(listener: () => void) {
  savedGrantsListeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    savedGrantsListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function writeSavedGrantIds(ids: string[]) {
  const serialized = JSON.stringify(ids);
  window.localStorage.setItem(SAVED_GRANTS_KEY, serialized);
  cachedSavedRaw = serialized;
  cachedSavedIds = ids;
  savedGrantsListeners.forEach((listener) => listener());
}

const EMPTY_SAVED_IDS: string[] = [];

function useSavedGrantIds() {
  return useSyncExternalStore(
    subscribeSavedGrants,
    readSavedGrantIds,
    () => EMPTY_SAVED_IDS,
  );
}

interface GrantFinderPageProps {
  organization: Organization | null;
  grants: Grant[];
}

export function GrantFinderPage({ organization, grants }: GrantFinderPageProps) {
  const { isGuest, isAuthenticated } = useUser();
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<GrantCategory | "all">("all");
  const [amountRange, setAmountRange] = useState<AmountRangeFilter>("any");
  const [deadlineRange, setDeadlineRange] = useState<DeadlineRangeFilter>("any");
  const [sort, setSort] = useState<GrantSortOption>("match");
  const savedGrantIds = useSavedGrantIds();

  const scoredGrants = useMemo(
    () => scoreAndFilterGrants(grants, organization),
    [grants, organization],
  );

  const filteredGrants = useMemo(
    () =>
      filterAndSortGrants(scoredGrants, {
        search,
        category,
        amountRange,
        deadlineRange,
        sort,
      }),
    [scoredGrants, search, category, amountRange, deadlineRange, sort],
  );

  function toggleSave(grantId: string) {
    const next = savedGrantIds.includes(grantId)
      ? savedGrantIds.filter((id) => id !== grantId)
      : [...savedGrantIds, grantId];

    writeSavedGrantIds(next);
  }

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setAmountRange("any");
    setDeadlineRange("any");
    setSort("match");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    amountRange !== "any" ||
    deadlineRange !== "any" ||
    sort !== "match";

  return (
    <AppShell header={null}>
      <div className="border-b border-border bg-surface px-4 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-text">Grant Finder</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Browse {grants.length} funding opportunities matched to your profile.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, description, keywords, or category…"
              className="flex-1 rounded-md border border-border bg-bg px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
            />
            <Button
              variant="secondary"
              onClick={() => setShowFilters((value) => !value)}
              className="shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-8 p-6 md:p-8">
        <aside
          className={`${showFilters ? "block" : "hidden"} w-full shrink-0 space-y-4 md:block md:w-72`}
        >
          <Card padding="md" className="space-y-4">
            <div>
              <Select
                label="Sort by"
                value={sort}
                onChange={(event) => setSort(event.target.value as GrantSortOption)}
                options={[
                  { value: "match", label: "Best match" },
                  { value: "deadline", label: "Deadline" },
                  { value: "amount", label: "Funding amount" },
                ]}
              />
            </div>

            <div>
              <Select
                label="Category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as GrantCategory | "all")
                }
                options={[
                  { value: "all", label: "All categories" },
                  ...GRANT_CATEGORIES.map((value) => ({ value, label: value })),
                ]}
              />
            </div>

            <div>
              <Select
                label="Funding amount"
                value={amountRange}
                onChange={(event) =>
                  setAmountRange(event.target.value as AmountRangeFilter)
                }
                options={[
                  { value: "any", label: "Any amount" },
                  { value: "under-25000", label: "Under $25,000" },
                  { value: "25000-75000", label: "$25,000 – $75,000" },
                  { value: "75000-150000", label: "$75,000 – $150,000" },
                  { value: "over-150000", label: "Over $150,000" },
                ]}
              />
            </div>

            <div>
              <Select
                label="Deadline"
                value={deadlineRange}
                onChange={(event) =>
                  setDeadlineRange(event.target.value as DeadlineRangeFilter)
                }
                options={[
                  { value: "any", label: "Any deadline" },
                  { value: "next-30", label: "Next 30 days" },
                  { value: "31-90", label: "31 – 90 days" },
                  { value: "over-90", label: "More than 90 days" },
                ]}
              />
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              Showing {filteredGrants.length} of {grants.length} grants
            </p>
            {!organization && isAuthenticated && !isGuest && (
              <p className="text-sm text-primary">
                <Link href="/dashboard" className="hover:underline">
                  Set up your organization profile
                </Link>{" "}
                for personalized recommendations on your dashboard.
              </p>
            )}
            {(isGuest || !isAuthenticated) && (
              <p className="text-sm text-text-secondary">
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Create free account
                </Link>{" "}
                to save grants and start applications.
              </p>
            )}
          </div>

          {filteredGrants.length === 0 ? (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-text">No grants found</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Try adjusting your search or filters to see more opportunities.
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredGrants.map((grant) => (
                <GrantBrowserCard
                  key={grant.id}
                  grant={grant}
                  saved={savedGrantIds.includes(grant.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
