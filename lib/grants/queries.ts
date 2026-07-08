import { createClient } from "@/lib/supabase/server";
import { mapGrantRow } from "@/lib/grants/map-grant";
import {
  getCaliforniaGrantById,
  getCaliforniaGrants,
  isCaliforniaGrantId,
  searchCaliforniaGrants,
  type CaliforniaGrantFilters,
} from "@/lib/grants/california-grants";
import {
  getSimplerGrantById,
  getSimplerGrants,
  isSimplerGrantId,
  searchSimplerGrants,
  type SimplerGrantFilters,
} from "@/lib/grants/simpler-grants";
import {
  getDaysUntilDeadline,
  getGrantSearchText,
  matchesAmountRange,
  matchesDeadlineRange,
  type AmountRangeFilter,
  type DeadlineRangeFilter,
} from "@/lib/grant-matching";
import type { Grant, GrantCategory, GrantRegion } from "@/types/grant";

const EXTERNAL_SEARCH_LIMIT = 75;

async function getLocalGrants(): Promise<Grant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("grants").select("*").order("title");

  if (error) {
    throw new Error(`Failed to load grants: ${error.message}`);
  }

  return (data ?? []).map(mapGrantRow);
}

export async function getAllGrants(): Promise<Grant[]> {
  const [localGrants, simplerGrants, californiaGrants] = await Promise.all([
    getLocalGrants(),
    getSimplerGrants().catch(() => []),
    getCaliforniaGrants().catch(() => []),
  ]);
  return [...localGrants, ...simplerGrants, ...californiaGrants].filter(
    (grant) => grant.status === "open" && (getDaysUntilDeadline(grant.deadline) ?? 999) >= 0,
  );
}

export async function getGrantById(id: string): Promise<Grant | null> {
  if (isSimplerGrantId(id)) {
    return getSimplerGrantById(id).catch(() => null);
  }

  if (isCaliforniaGrantId(id)) {
    return getCaliforniaGrantById(id).catch(() => null);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load grant: ${error.message}`);
  }

  return data ? mapGrantRow(data) : null;
}

export async function getGrantsByCategory(category: GrantCategory): Promise<Grant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .eq("category", category)
    .order("title");

  if (error) {
    throw new Error(`Failed to load grants: ${error.message}`);
  }

  return (data ?? []).map(mapGrantRow);
}

export async function getGrantsByRegion(region: GrantRegion): Promise<Grant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .eq("region", region)
    .order("title");

  if (error) {
    throw new Error(`Failed to load grants: ${error.message}`);
  }

  return (data ?? []).map(mapGrantRow);
}

export async function searchGrants(query: string): Promise<Grant[]> {
  const normalized = query.trim().replace(/[%_,().]/g, "");
  if (!normalized) {
    return getAllGrants();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .or(
      `title.ilike.%${normalized}%,description.ilike.%${normalized}%,funder.ilike.%${normalized}%,category.ilike.%${normalized}%,region.ilike.%${normalized}%`,
    )
    .order("title");

  if (error) {
    throw new Error(`Failed to search grants: ${error.message}`);
  }

  return (data ?? []).map(mapGrantRow);
}

export interface GrantCatalogFilters
  extends SimplerGrantFilters,
    CaliforniaGrantFilters {
  amountRange?: AmountRangeFilter | AmountRangeFilter[];
  deadlineRange?: DeadlineRangeFilter | DeadlineRangeFilter[];
}

function grantMatchesCatalogFilters(grant: Grant, filters: GrantCatalogFilters): boolean {
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

  return grant.status === "open" && daysLeft >= 0;
}

export async function getFilteredGrants(filters: GrantCatalogFilters): Promise<Grant[]> {
  const [localGrants, simplerGrants, californiaGrants] = await Promise.all([
    getLocalGrants(),
    searchSimplerGrants({ filters, limit: EXTERNAL_SEARCH_LIMIT }).catch(() => []),
    searchCaliforniaGrants({ filters, limit: EXTERNAL_SEARCH_LIMIT }).catch(() => []),
  ]);

  return [
    ...localGrants.filter((grant) => grantMatchesCatalogFilters(grant, filters)),
    ...simplerGrants,
    ...californiaGrants,
  ];
}
