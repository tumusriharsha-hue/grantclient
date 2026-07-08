"use client";

import { Check, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { toggleSavedGrant } from "@/app/actions/saved-grants";
import { AppShell } from "@/components/layout";
import { Button, Card, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
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

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function AnimatedDots() {
  return (
    <span className="inline-flex w-5 justify-start" aria-hidden="true">
      <span className="animate-pulse">.</span>
      <span className="animate-pulse [animation-delay:150ms]">.</span>
      <span className="animate-pulse [animation-delay:300ms]">.</span>
    </span>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onValueChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label id={`${id}-label`} className="block text-xs font-semibold text-text-secondary">
        {label}
      </label>
      <button
        type="button"
        aria-labelledby={`${id}-label`}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-bg px-3 py-2.5 text-left text-sm font-medium text-text shadow-sm transition-colors hover:border-border-hover hover:bg-surface focus:border-primary focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-primary/10"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selectedOption?.label ?? "Select"}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface text-primary">
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute left-0 right-0 top-full z-50 mt-0 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg"
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-primary-light text-primary-hover hover:bg-primary-light hover:text-primary-hover"
                    : "text-text-secondary hover:bg-primary-light/60 hover:text-text",
                )}
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="truncate">{option.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MultiFilterSelectProps {
  label: string;
  emptyLabel: string;
  values: string[];
  options: { value: string; label: string }[];
  onValuesChange: (values: string[]) => void;
}

function MultiFilterSelect({
  label,
  emptyLabel,
  values,
  options,
  onValuesChange,
}: MultiFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);
  const displayLabel =
    selectedLabels.length === 0
      ? emptyLabel
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels.length} selected`;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function toggleValue(nextValue: string) {
    onValuesChange(
      values.includes(nextValue)
        ? values.filter((value) => value !== nextValue)
        : [...values, nextValue],
    );
  }

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <label id={`${id}-label`} className="block text-xs font-semibold text-text-secondary">
        {label}
      </label>
      <button
        type="button"
        aria-labelledby={`${id}-label`}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-bg px-3 py-2.5 text-left text-sm font-medium text-text shadow-sm transition-colors hover:border-border-hover hover:bg-surface focus:border-primary focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-primary/10"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{displayLabel}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface text-primary">
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={`${id}-label`}
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-full z-50 mt-0 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg"
        >
          <button
            type="button"
            className={cn(
              "mb-1 flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
              values.length === 0
                ? "bg-primary-light text-primary-hover"
                : "text-text-secondary hover:bg-primary-light/60 hover:text-text",
            )}
            onClick={() => onValuesChange([])}
          >
            <span>{emptyLabel}</span>
            {values.length === 0 && <Check className="h-4 w-4 text-primary" />}
          </button>

          {options.map((option, index) => {
            const selected = values.includes(option.value);
            const previousSelected =
              index > 0 && values.includes(options[index - 1].value);
            const nextSelected =
              index < options.length - 1 && values.includes(options[index + 1].value);

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-primary-light text-primary-hover"
                    : "text-text-secondary hover:bg-primary-light/60 hover:text-text",
                  selected && previousSelected && "rounded-t-none",
                  selected && nextSelected && "rounded-b-none",
                )}
                onClick={() => toggleValue(option.value)}
              >
                <span className="truncate">{option.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface GrantFinderPageProps {
  organization: Organization | null;
  grants: Grant[];
  savedGrantIds?: string[];
  initialSearch?: string;
}

export function GrantFinderPage({
  organization,
  grants,
  savedGrantIds: initialSavedGrantIds = [],
  initialSearch = "",
}: GrantFinderPageProps) {
  const { isGuest, isAuthenticated } = useUser();
  const [catalogGrants, setCatalogGrants] = useState(grants);
  const [savedGrantIds, setSavedGrantIds] = useState(initialSavedGrantIds);
  const [, startSaveTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [categories, setCategories] = useState<GrantCategory[]>([]);
  const [amountRanges, setAmountRanges] = useState<AmountRangeFilter[]>([]);
  const [deadlineRanges, setDeadlineRanges] = useState<DeadlineRangeFilter[]>([]);
  const [sort, setSort] = useState<GrantSortOption>("match");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      const params = new URLSearchParams({ search });
      categories.forEach((value) => params.append("category", value));
      amountRanges.forEach((value) => params.append("amountRange", value));
      deadlineRanges.forEach((value) => params.append("deadlineRange", value));

      setIsRefreshing(true);

      try {
        const response = await fetch(`/api/grants/search?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to refresh grants");
        }

        const payload = (await response.json()) as { grants?: Grant[] };
        setCatalogGrants(payload.grants ?? grants);
      } catch {
        if (!controller.signal.aborted) {
          setCatalogGrants(grants);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsRefreshing(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [amountRanges, categories, deadlineRanges, grants, search]);

  const scoredGrants = useMemo(
    () => scoreAndFilterGrants(catalogGrants, organization),
    [catalogGrants, organization],
  );

  const filteredGrants = useMemo(
    () =>
      filterAndSortGrants(scoredGrants, {
        search,
        category: categories,
        amountRange: amountRanges,
        deadlineRange: deadlineRanges,
        sort,
      }),
    [scoredGrants, search, categories, amountRanges, deadlineRanges, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filteredGrants.length / pageSize));
  const displayedPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (displayedPage - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, filteredGrants.length);
  const paginatedGrants = filteredGrants.slice(pageStartIndex, pageEndIndex);

  function toggleSave(grantId: string) {
    const wasSaved = savedGrantIds.includes(grantId);
    const next = wasSaved
      ? savedGrantIds.filter((id) => id !== grantId)
      : [...savedGrantIds, grantId];

    setSavedGrantIds(next);

    startSaveTransition(async () => {
      const result = await toggleSavedGrant(grantId);

      if (!result.success) {
        setSavedGrantIds(savedGrantIds);
        return;
      }

      setSavedGrantIds((current) => {
        if (result.saved && !current.includes(grantId)) {
          return [...current, grantId];
        }

        if (!result.saved) {
          return current.filter((id) => id !== grantId);
        }

        return current;
      });
    });
  }

  function clearFilters() {
    setSearch("");
    setCategories([]);
    setAmountRanges([]);
    setDeadlineRanges([]);
    setSort("match");
    setCurrentPage(1);
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    categories.length > 0 ||
    amountRanges.length > 0 ||
    deadlineRanges.length > 0 ||
    sort !== "match";

  return (
    <AppShell header={null}>
      <div className="border-b border-border bg-surface px-4 py-4 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-text">Grant Finder</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Browse {catalogGrants.length} funding opportunities matched to your profile.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search title, description, keywords, or category…"
              className="flex-1 rounded-md border border-border bg-bg px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
            />
            <Button
              variant="secondary"
              onClick={() => setShowFilters((value) => !value)}
              className="w-full shrink-0 sm:w-auto lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:gap-8 lg:p-8">
        <aside
          className={`${showFilters ? "block" : "hidden"} w-full shrink-0 space-y-4 lg:block lg:w-72`}
        >
          <Card padding="md" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-sm font-semibold text-text">Filters</h2>
                <p className="mt-0.5 text-xs text-text-muted">Refine matching grants</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-light text-primary">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
            </div>

            <div>
              <FilterSelect
                label="Sort by"
                value={sort}
                onValueChange={(nextValue) => {
                  setSort(nextValue as GrantSortOption);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "match", label: "Best match" },
                  { value: "deadline", label: "Deadline" },
                  { value: "amount", label: "Funding amount" },
                ]}
              />
            </div>

            <div>
              <MultiFilterSelect
                label="Category"
                emptyLabel="All categories"
                values={categories}
                onValuesChange={(nextValues) => {
                  setCategories(nextValues as GrantCategory[]);
                  setCurrentPage(1);
                }}
                options={GRANT_CATEGORIES.map((value) => ({ value, label: value }))}
              />
            </div>

            <div>
              <MultiFilterSelect
                label="Funding amount"
                emptyLabel="Any amount"
                values={amountRanges}
                onValuesChange={(nextValues) => {
                  setAmountRanges(nextValues as AmountRangeFilter[]);
                  setCurrentPage(1);
                }}
                options={[
                  { value: "under-25000", label: "Under $25,000" },
                  { value: "25000-75000", label: "$25,000 – $75,000" },
                  { value: "75000-150000", label: "$75,000 – $150,000" },
                  { value: "over-150000", label: "Over $150,000" },
                ]}
              />
            </div>

            <div>
              <MultiFilterSelect
                label="Deadline"
                emptyLabel="Any deadline"
                values={deadlineRanges}
                onValuesChange={(nextValues) => {
                  setDeadlineRanges(nextValues as DeadlineRangeFilter[]);
                  setCurrentPage(1);
                }}
                options={[
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
              Showing{" "}
              {filteredGrants.length > 0
                ? `${pageStartIndex + 1}-${pageEndIndex}`
                : "0"}{" "}
              of {filteredGrants.length} grants
              {isRefreshing && (
                <span className="whitespace-nowrap">
                  {" "}
                  &middot; Refreshing results
                  <AnimatedDots />
                </span>
              )}
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

          {filteredGrants.length === 0 && isRefreshing ? (
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-text">
                Refreshing results
                <AnimatedDots />
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Searching current grant sources for matching opportunities.
              </p>
            </Card>
          ) : filteredGrants.length === 0 ? (
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
            <>
              <div className="space-y-4">
                {paginatedGrants.map((grant) => (
                  <GrantBrowserCard
                    key={grant.id}
                    grant={grant}
                    saved={savedGrantIds.includes(grant.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-text-secondary">
                  Page {displayedPage} of {totalPages}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Select
                    label="Grants per page"
                    value={String(pageSize)}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    options={PAGE_SIZE_OPTIONS.map((value) => ({
                      value: String(value),
                      label: String(value),
                    }))}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, displayedPage - 1))}
                      disabled={displayedPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, displayedPage + 1))}
                      disabled={displayedPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
