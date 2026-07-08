import {
  getDaysUntilDeadline,
  getGrantSearchText,
  matchesAmountRange,
  matchesDeadlineRange,
  type AmountRangeFilter,
  type DeadlineRangeFilter,
} from "@/lib/grant-matching";
import { sanitizeGrantText } from "@/lib/grants/sanitize-text";
import type { Grant, GrantCategory, GrantRegion, GrantStatus } from "@/types/grant";

const SEARCH_URL = "https://data.ca.gov/api/3/action/datastore_search";
const RESOURCE_ID = "111c8c88-21f6-453c-ae2c-b4785a0624f5";
const EXTERNAL_ID_PREFIX = "ca-open-data-";
const DEFAULT_PAGE_SIZE = 100;
const MAX_FILTERED_PAGES = 50;
const FILTERED_PAGE_BATCH_SIZE = 5;

type JsonRecord = Record<string, unknown>;

interface CKANResponse<T> {
  success: boolean;
  result?: {
    total?: number;
    records?: T[];
  };
}

export interface CaliforniaGrantFilters {
  search?: string;
  category?: GrantCategory | "all" | GrantCategory[];
  amountRange?: AmountRangeFilter | AmountRangeFilter[];
  deadlineRange?: DeadlineRangeFilter | DeadlineRangeFilter[];
}

const CATEGORY_KEYWORDS: Array<[GrantCategory, string[]]> = [
  ["Education", ["education", "school", "student", "teacher", "literacy", "college"]],
  ["Youth Programs", ["youth", "children", "teen", "adolescent", "family"]],
  ["Sports & Recreation", ["sport", "recreation", "park", "fitness", "outdoor"]],
  ["STEM & Technology", ["science", "technology", "engineering", "math", "stem", "digital"]],
  ["Community Development", ["community", "housing", "economic", "workforce", "development"]],
  ["Arts & Culture", ["arts", "culture", "museum", "humanities", "historic", "creative"]],
  ["Environment", ["environment", "climate", "conservation", "energy", "water"]],
  ["Healthcare", ["health", "medical", "mental health", "clinical", "disease"]],
  ["Food Security", ["food", "nutrition", "agriculture", "hunger"]],
  ["Animal Welfare", ["animal", "wildlife", "veterinary"]],
  ["Capacity Building", ["capacity", "technical assistance", "training", "operations"]],
];

function getString(record: JsonRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function getNumber(record: JsonRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.round(value);
    }

    if (typeof value === "string") {
      const amounts = value
        .match(/\d[\d,]*(?:\.\d+)?/g)
        ?.map((amount) => Number(amount.replace(/,/g, "")))
        .filter((amount) => Number.isFinite(amount) && amount > 0);

      if (amounts?.length) {
        return Math.round(Math.max(...amounts));
      }
    }
  }

  return undefined;
}

function normalizeDate(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function inferCategory(text: string): GrantCategory {
  const normalized = text.toLowerCase();
  const match = CATEGORY_KEYWORDS.find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  );

  return match?.[0] ?? "Community Development";
}

function inferStatus(deadline: string | undefined, rawStatus: string | undefined): GrantStatus {
  const normalizedStatus = rawStatus?.toLowerCase();

  if (normalizedStatus?.includes("closed") || normalizedStatus?.includes("inactive")) {
    return "closed";
  }

  if (normalizedStatus?.includes("active")) {
    return "open";
  }

  if (!deadline) {
    return "open";
  }

  const deadlineDate = new Date(`${deadline}T23:59:59`);
  return deadlineDate.getTime() < Date.now() ? "closed" : "open";
}

function toExternalId(recordId: string): string {
  return `${EXTERNAL_ID_PREFIX}${recordId}`;
}

function fromExternalId(id: string): string | null {
  return id.startsWith(EXTERNAL_ID_PREFIX) ? id.slice(EXTERNAL_ID_PREFIX.length) : null;
}

export function isCaliforniaGrantId(id: string): boolean {
  return fromExternalId(id) !== null;
}

function mapRecordToGrant(record: JsonRecord): Grant | null {
  const recordId = getString(record, ["_id", "PortalID", "GrantID"]);

  if (!recordId) {
    return null;
  }

  const title = sanitizeGrantText(
    getString(record, ["Title"]) ?? `California Grant ${recordId}`,
  );
  const description =
    sanitizeGrantText(
      getString(record, ["Description", "Purpose"]) ??
        "California state grant opportunity imported from the California Open Data Portal.",
    );
  const funder = sanitizeGrantText(getString(record, ["AgencyDept"]) ?? "State of California");
  const deadline = normalizeDate(getString(record, ["ApplicationDeadline"]));
  const categoryText = [
    getString(record, ["Categories", "CategorySuggestion", "Type"]),
    title,
    description,
    funder,
  ]
    .filter(Boolean)
    .join(" ");
  const today = new Date().toISOString();
  const updatedAt = normalizeDate(getString(record, ["LastUpdated"])) ?? today;

  return {
    id: toExternalId(recordId),
    title,
    description,
    funder,
    category: inferCategory(categoryText),
    region: "Western US" satisfies GrantRegion,
    status: inferStatus(deadline, getString(record, ["Status"])),
    amount: getNumber(record, ["EstAvailFunds", "EstAmounts"]),
    deadline,
    applicationUrl: getString(record, ["GrantURL", "AgencyURL"]) ?? "https://www.grants.ca.gov/",
    createdAt: normalizeDate(getString(record, ["OpenDate"])) ?? updatedAt,
    updatedAt,
  };
}

async function fetchCaliforniaPage({
  offset,
  limit,
  filters,
}: {
  offset: number;
  limit: number;
  filters?: Record<string, string | number>;
}): Promise<Grant[]> {
  const params = new URLSearchParams({
    resource_id: RESOURCE_ID,
    limit: String(limit),
    offset: String(offset),
  });

  if (filters) {
    params.set("filters", JSON.stringify(filters));
  }

  const response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`California grants API returned ${response.status}`);
  }

  const payload = (await response.json()) as CKANResponse<JsonRecord>;

  if (!payload.success) {
    throw new Error("California grants API returned an unsuccessful response");
  }

  return (payload.result?.records ?? []).flatMap((record) => {
    const grant = mapRecordToGrant(record);
    return grant ? [grant] : [];
  });
}

export async function getCaliforniaGrants(limit = DEFAULT_PAGE_SIZE): Promise<Grant[]> {
  return fetchCaliforniaPage({ offset: 0, limit });
}

function grantMatchesFilters(grant: Grant, filters: CaliforniaGrantFilters): boolean {
  const search = filters.search?.trim().toLowerCase();

  if (search && !getGrantSearchText(grant).includes(search)) {
    return false;
  }

  const activeCategories = Array.isArray(filters.category)
    ? filters.category
    : filters.category && filters.category !== "all"
      ? [filters.category]
      : [];

  if (activeCategories.length > 0 && !activeCategories.includes(grant.category)) {
    return false;
  }

  const activeAmountRanges = Array.isArray(filters.amountRange)
    ? filters.amountRange.filter((range) => range !== "any")
    : filters.amountRange && filters.amountRange !== "any"
      ? [filters.amountRange]
      : [];

  if (
    activeAmountRanges.length > 0 &&
    !activeAmountRanges.some((range) => matchesAmountRange(grant.amount, range))
  ) {
    return false;
  }

  const daysLeft = getDaysUntilDeadline(grant.deadline) ?? 999;

  const activeDeadlineRanges = Array.isArray(filters.deadlineRange)
    ? filters.deadlineRange.filter((range) => range !== "any")
    : filters.deadlineRange && filters.deadlineRange !== "any"
      ? [filters.deadlineRange]
      : [];

  if (
    activeDeadlineRanges.length > 0 &&
    !activeDeadlineRanges.some((range) => matchesDeadlineRange(daysLeft, range))
  ) {
    return false;
  }

  return grant.status === "open";
}

export async function searchCaliforniaGrants({
  filters,
  limit = DEFAULT_PAGE_SIZE,
}: {
  filters: CaliforniaGrantFilters;
  limit?: number;
}): Promise<Grant[]> {
  const matches: Grant[] = [];
  const seenIds = new Set<string>();

  for (
    let batchStart = 0;
    batchStart < MAX_FILTERED_PAGES;
    batchStart += FILTERED_PAGE_BATCH_SIZE
  ) {
    const offsets = Array.from(
      {
        length: Math.min(
          FILTERED_PAGE_BATCH_SIZE,
          MAX_FILTERED_PAGES - batchStart,
        ),
      },
      (_, index) => (batchStart + index) * DEFAULT_PAGE_SIZE,
    );
    const pages = await Promise.all(
      offsets.map((offset) => fetchCaliforniaPage({ offset, limit: DEFAULT_PAGE_SIZE })),
    );

    for (const grant of pages.flat()) {
      if (!seenIds.has(grant.id) && grantMatchesFilters(grant, filters)) {
        seenIds.add(grant.id);
        matches.push(grant);
      }

      if (matches.length >= limit) {
        return matches;
      }
    }

    if (pages.some((page) => page.length === 0)) {
      break;
    }
  }

  return matches;
}

export async function getCaliforniaGrantById(id: string): Promise<Grant | null> {
  const recordId = fromExternalId(id);
  if (!recordId) return null;

  const filterAttempts: Array<Record<string, string | number>> = [
    { GrantID: recordId },
    { PortalID: recordId },
    { _id: recordId },
  ];

  const numericId = Number(recordId);
  if (Number.isFinite(numericId)) {
    filterAttempts.unshift({ _id: numericId });
  }

  for (const filters of filterAttempts) {
    const grants = await fetchCaliforniaPage({
      offset: 0,
      limit: 1,
      filters,
    });

    if (grants[0]) {
      return grants[0];
    }
  }

  for (
    let batchStart = 0;
    batchStart < MAX_FILTERED_PAGES;
    batchStart += FILTERED_PAGE_BATCH_SIZE
  ) {
    const offsets = Array.from(
      {
        length: Math.min(
          FILTERED_PAGE_BATCH_SIZE,
          MAX_FILTERED_PAGES - batchStart,
        ),
      },
      (_, index) => (batchStart + index) * DEFAULT_PAGE_SIZE,
    );
    const pages = await Promise.all(
      offsets.map((offset) => fetchCaliforniaPage({ offset, limit: DEFAULT_PAGE_SIZE })),
    );
    const grant = pages.flat().find((item) => item.id === id);

    if (grant) {
      return grant;
    }

    if (pages.some((page) => page.length === 0)) {
      break;
    }
  }

  return null;
}
