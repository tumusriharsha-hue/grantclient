import type { Grant, GrantCategory, GrantRegion, GrantStatus } from "@/types/grant";
import { sanitizeGrantText } from "@/lib/grants/sanitize-text";
import {
  getDaysUntilDeadline,
  getGrantSearchText,
  matchesAmountRange,
  matchesDeadlineRange,
  type AmountRangeFilter,
  type DeadlineRangeFilter,
} from "@/lib/grant-matching";

const SEARCH_URL = "https://api.simpler.grants.gov/v1/opportunities/search";
const EXTERNAL_ID_PREFIX = "grants-gov-";
const DEFAULT_PAGE_SIZE = 100;
const MAX_FILTERED_PAGES = 10;
const FILTERED_PAGE_BATCH_SIZE = 2;

type JsonRecord = Record<string, unknown>;

export interface SimplerGrantFilters {
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

function getApiKey(): string | undefined {
  return process.env.SIMPLER_GRANTS_API_KEY ?? process.env.GRANTS_GOV_API_KEY;
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

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

function getNestedString(
  record: JsonRecord,
  key: string,
  nestedKeys: string[],
): string | undefined {
  const nested = asRecord(record[key]);
  return nested ? getString(nested, nestedKeys) : undefined;
}

function getNumber(record: JsonRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.round(value);
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[$,]/g, ""));
      if (Number.isFinite(parsed)) {
        return Math.round(parsed);
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

  if (normalizedStatus?.includes("closed") || normalizedStatus?.includes("archived")) {
    return "closed";
  }

  if (!deadline) {
    return "open";
  }

  const deadlineDate = new Date(`${deadline}T23:59:59`);
  return deadlineDate.getTime() < Date.now() ? "closed" : "open";
}

function extractOpportunities(payload: unknown): JsonRecord[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => {
      const record = asRecord(item);
      return record ? [record] : [];
    });
  }

  const record = asRecord(payload);
  if (!record) return [];

  for (const key of ["data", "opportunities", "results", "items"]) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.flatMap((item) => {
        const opportunity = asRecord(item);
        return opportunity ? [opportunity] : [];
      });
    }
  }

  return [];
}

function toExternalId(opportunityId: string): string {
  return `${EXTERNAL_ID_PREFIX}${opportunityId}`;
}

function fromExternalId(id: string): string | null {
  return id.startsWith(EXTERNAL_ID_PREFIX) ? id.slice(EXTERNAL_ID_PREFIX.length) : null;
}

export function isSimplerGrantId(id: string): boolean {
  return fromExternalId(id) !== null;
}

function mapOpportunityToGrant(opportunity: JsonRecord): Grant | null {
  const opportunityId = getString(opportunity, [
    "opportunity_id",
    "opportunityId",
    "id",
    "opportunity_number",
    "opportunityNumber",
    "number",
  ]);

  if (!opportunityId) {
    return null;
  }

  const title = sanitizeGrantText(
    getString(opportunity, ["opportunity_title", "opportunityTitle", "title"]) ??
      `Grants.gov Opportunity ${opportunityId}`,
  );
  const funder = sanitizeGrantText(
    getString(opportunity, [
      "agency_name",
      "agencyName",
      "agency",
      "funding_agency",
      "fundingAgency",
    ]) ?? "Grants.gov",
  );
  const description = sanitizeGrantText(
    getString(opportunity, ["description", "summary", "synopsis"]) ??
      getNestedString(opportunity, "summary", [
        "description",
        "summary_description",
        "summaryDescription",
        "synopsis",
      ]) ??
      "Federal funding opportunity imported from Grants.gov.",
  );
  const deadline = normalizeDate(
    getString(opportunity, [
      "close_date",
      "closeDate",
      "deadline",
      "application_due_date",
      "applicationDueDate",
    ]) ?? getNestedString(opportunity, "summary", ["close_date", "closeDate"]),
  );
  const amount = getNumber(opportunity, [
    "award_ceiling",
    "awardCeiling",
    "estimated_total_program_funding",
    "estimatedTotalProgramFunding",
    "expected_award_amount",
    "expectedAwardAmount",
  ]);
  const applicationUrl =
    getString(opportunity, ["application_url", "applicationUrl", "url"]) ??
    `https://www.grants.gov/search-results-detail/${opportunityId}`;
  const searchText = [title, description, funder].join(" ");
  const today = new Date().toISOString();
  const createdAt =
    normalizeDate(getString(opportunity, ["created_at", "createdAt", "post_date", "postDate"])) ??
    today;
  const updatedAt =
    normalizeDate(
      getString(opportunity, ["updated_at", "updatedAt", "last_updated", "lastUpdated"]),
    ) ?? today;

  return {
    id: toExternalId(opportunityId),
    title,
    description,
    funder,
    category: inferCategory(searchText),
    region: "National" satisfies GrantRegion,
    status: inferStatus(deadline, getString(opportunity, ["status", "opportunity_status"])),
    amount,
    deadline,
    applicationUrl,
    createdAt,
    updatedAt,
  };
}

async function fetchSimplerJson(init: RequestInit): Promise<unknown> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return null;
  }

  const response = await fetch(SEARCH_URL, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Grants.gov API returned ${response.status}`);
  }

  return response.json();
}

export async function getSimplerGrants(pageSize = DEFAULT_PAGE_SIZE): Promise<Grant[]> {
  return getSimplerGrantsPage({ pageOffset: 1, pageSize });
}

async function getSimplerGrantsPage({
  pageOffset,
  pageSize,
}: {
  pageOffset: number;
  pageSize: number;
}): Promise<Grant[]> {
  const payload = await fetchSimplerJson({
    method: "POST",
    body: JSON.stringify({
      pagination: {
        page_offset: pageOffset,
        page_size: pageSize,
        sort_order: [
          {
            order_by: "opportunity_id",
            sort_direction: "descending",
          },
        ],
      },
    }),
  });

  return extractOpportunities(payload).flatMap((opportunity) => {
    const grant = mapOpportunityToGrant(opportunity);
    return grant ? [grant] : [];
  });
}

function grantMatchesFilters(grant: Grant, filters: SimplerGrantFilters): boolean {
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

export async function searchSimplerGrants({
  filters,
  limit = DEFAULT_PAGE_SIZE,
}: {
  filters: SimplerGrantFilters;
  limit?: number;
}): Promise<Grant[]> {
  const matches: Grant[] = [];
  const seenIds = new Set<string>();

  for (
    let batchStart = 1;
    batchStart <= MAX_FILTERED_PAGES;
    batchStart += FILTERED_PAGE_BATCH_SIZE
  ) {
    const batchOffsets = Array.from(
      {
        length: Math.min(
          FILTERED_PAGE_BATCH_SIZE,
          MAX_FILTERED_PAGES - batchStart + 1,
        ),
      },
      (_, index) => batchStart + index,
    );
    const pages = await Promise.all(
      batchOffsets.map((pageOffset) =>
        getSimplerGrantsPage({
          pageOffset,
          pageSize: DEFAULT_PAGE_SIZE,
        }),
      ),
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

export async function getSimplerGrantById(id: string): Promise<Grant | null> {
  if (!fromExternalId(id)) return null;

  const grants = await getSimplerGrants(100);
  return grants.find((grant) => grant.id === id) ?? null;
}
