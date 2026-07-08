import type { Grant, GrantCategory } from "@/types/grant";
import type { Organization } from "@/types";
import { enrichGrant, enrichGrants } from "@/lib/grants/enrich-grant";
import { matchGrant, shouldExcludeGrant } from "@/lib/matching";

const CATEGORY_KEYWORDS: Record<GrantCategory, string[]> = {
  Education: ["education", "school", "literacy", "students", "learning"],
  "Youth Programs": ["youth", "teens", "young people", "mentoring", "after-school"],
  "Sports & Recreation": ["sports", "recreation", "athletics", "play", "outdoor"],
  "STEM & Technology": ["stem", "technology", "science", "engineering", "digital"],
  "Community Development": ["community", "neighborhood", "housing", "economic"],
  "Arts & Culture": ["arts", "culture", "music", "creative", "heritage"],
  Environment: ["environment", "climate", "conservation", "sustainability", "green"],
  Healthcare: ["health", "healthcare", "medical", "wellness", "clinical"],
  "Food Security": ["food", "hunger", "nutrition", "pantry", "meals"],
  "Animal Welfare": ["animal", "pets", "shelter", "veterinary", "wildlife"],
  "Capacity Building": ["capacity", "nonprofit", "governance", "leadership", "operations"],
};

export interface ScoredGrant extends Grant {
  matchScore: number;
  matchReasons: string[];
  daysLeft: number;
  deadlineLabel: string;
}

export function getDaysUntilDeadline(deadline?: string): number | null {
  if (!deadline) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${deadline}T00:00:00`);
  const diffMs = due.getTime() - today.getTime();

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatGrantDeadline(deadline?: string): {
  daysLeft: number;
  deadlineLabel: string;
} {
  const daysLeft = getDaysUntilDeadline(deadline);

  if (daysLeft === null) {
    return { daysLeft: 999, deadlineLabel: "Rolling deadline" };
  }

  if (daysLeft < 0) {
    return { daysLeft, deadlineLabel: "Closed" };
  }

  if (daysLeft === 0) {
    return { daysLeft, deadlineLabel: "Due today" };
  }

  if (daysLeft === 1) {
    return { daysLeft, deadlineLabel: "Due tomorrow" };
  }

  const formatted = deadline
    ? new Date(`${deadline}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "TBD";

  return {
    daysLeft,
    deadlineLabel: `${formatted} (${daysLeft} days)`,
  };
}

export function getGrantSearchText(grant: Grant): string {
  const categoryKeywords = CATEGORY_KEYWORDS[grant.category] ?? [];

  return [
    grant.title,
    grant.description,
    grant.category,
    grant.funder,
    grant.region,
    ...categoryKeywords,
  ]
    .join(" ")
    .toLowerCase();
}

export function scoreGrant(
  grant: Grant,
  organization: Organization | null,
): ScoredGrant {
  const enriched = enrichGrant(grant);
  const { daysLeft, deadlineLabel } = formatGrantDeadline(grant.deadline);
  const match = matchGrant(organization, enriched);

  return {
    ...enriched,
    matchScore: match.score,
    matchReasons: match.reasons,
    daysLeft,
    deadlineLabel,
  };
}

export function scoreGrants(
  grants: Grant[],
  organization: Organization | null,
): ScoredGrant[] {
  return grants.map((grant) => scoreGrant(grant, organization));
}

export function scoreAndFilterGrants(
  grants: Grant[],
  organization: Organization | null,
): ScoredGrant[] {
  return enrichGrants(grants)
    .filter((grant) => !shouldExcludeGrant(organization, grant))
    .map((grant) => {
      const { daysLeft, deadlineLabel } = formatGrantDeadline(grant.deadline);
      const match = matchGrant(organization, grant);

      return {
        ...grant,
        matchScore: match.score,
        matchReasons: match.reasons,
        daysLeft,
        deadlineLabel,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export type AmountRangeFilter =
  | "any"
  | "under-25000"
  | "25000-75000"
  | "75000-150000"
  | "over-150000";

export type DeadlineRangeFilter =
  | "any"
  | "next-30"
  | "31-90"
  | "over-90";

export type GrantSortOption = "match" | "deadline" | "amount";

export interface GrantBrowserFilters {
  search: string;
  category: GrantCategory | "all" | GrantCategory[];
  amountRange: AmountRangeFilter | AmountRangeFilter[];
  deadlineRange: DeadlineRangeFilter | DeadlineRangeFilter[];
  sort: GrantSortOption;
}

export function matchesAmountRange(
  amount: number | undefined,
  range: AmountRangeFilter,
): boolean {
  if (range === "any") return true;
  if (amount === undefined) return false;

  switch (range) {
    case "under-25000":
      return amount < 25000;
    case "25000-75000":
      return amount >= 25000 && amount <= 75000;
    case "75000-150000":
      return amount > 75000 && amount <= 150000;
    case "over-150000":
      return amount > 150000;
    default:
      return true;
  }
}

function matchesAnyAmountRange(
  amount: number | undefined,
  ranges: AmountRangeFilter | AmountRangeFilter[],
): boolean {
  const activeRanges = Array.isArray(ranges)
    ? ranges.filter((range) => range !== "any")
    : ranges === "any"
      ? []
      : [ranges];

  return activeRanges.length === 0
    ? true
    : activeRanges.some((range) => matchesAmountRange(amount, range));
}

export function matchesDeadlineRange(
  daysLeft: number,
  range: DeadlineRangeFilter,
): boolean {
  if (range === "any") return true;
  if (daysLeft < 0) return false;

  switch (range) {
    case "next-30":
      return daysLeft <= 30;
    case "31-90":
      return daysLeft >= 31 && daysLeft <= 90;
    case "over-90":
      return daysLeft > 90;
    default:
      return true;
  }
}

function matchesAnyDeadlineRange(
  daysLeft: number,
  ranges: DeadlineRangeFilter | DeadlineRangeFilter[],
): boolean {
  const activeRanges = Array.isArray(ranges)
    ? ranges.filter((range) => range !== "any")
    : ranges === "any"
      ? []
      : [ranges];

  return activeRanges.length === 0
    ? true
    : activeRanges.some((range) => matchesDeadlineRange(daysLeft, range));
}

export function filterAndSortGrants(
  grants: ScoredGrant[],
  filters: GrantBrowserFilters,
): ScoredGrant[] {
  const search = filters.search.trim().toLowerCase();

  const filtered = grants.filter((grant) => {
    if (search && !getGrantSearchText(grant).includes(search)) {
      return false;
    }

    const activeCategories = Array.isArray(filters.category)
      ? filters.category
      : filters.category === "all"
        ? []
        : [filters.category];

    if (activeCategories.length > 0 && !activeCategories.includes(grant.category)) {
      return false;
    }

    if (!matchesAnyAmountRange(grant.amount, filters.amountRange)) {
      return false;
    }

    if (!matchesAnyDeadlineRange(grant.daysLeft, filters.deadlineRange)) {
      return false;
    }

    return grant.status === "open" && grant.daysLeft >= 0;
  });

  return filtered.sort((a, b) => {
    switch (filters.sort) {
      case "deadline":
        return a.daysLeft - b.daysLeft;
      case "amount":
        return (b.amount ?? 0) - (a.amount ?? 0);
      case "match":
      default:
        return b.matchScore - a.matchScore;
    }
  });
}

export function getTopMatchedGrants(
  grants: Grant[],
  organization: Organization | null,
  limit = 3,
): ScoredGrant[] {
  return scoreAndFilterGrants(grants, organization).slice(0, limit);
}
