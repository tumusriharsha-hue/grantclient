import { NextResponse, type NextRequest } from "next/server";
import { isGuestUser } from "@/lib/auth/session";
import { getFilteredGrants, type GrantCatalogFilters } from "@/lib/grants/queries";
import { createClient } from "@/lib/supabase/server";
import {
  type AmountRangeFilter,
  type DeadlineRangeFilter,
} from "@/lib/grant-matching";
import { GRANT_CATEGORIES, type GrantCategory } from "@/types/grant";
import type { Grant } from "@/types/grant";

const AMOUNT_RANGES = [
  "any",
  "under-25000",
  "25000-75000",
  "75000-150000",
  "over-150000",
] as const satisfies readonly AmountRangeFilter[];

const DEADLINE_RANGES = ["any", "next-30", "31-90", "over-90"] as const satisfies readonly DeadlineRangeFilter[];
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const SEARCH_CACHE_TTL_MS = 60_000;
const MAX_SEARCH_RESULTS = 150;
const CACHE_HEADERS = {
  "Cache-Control": "private, max-age=30",
  Vary: "Cookie",
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type SearchCacheEntry = {
  expiresAt: number;
  grants: Grant[];
};

const rateLimits = new Map<string, RateLimitEntry>();
const searchCache = new Map<string, SearchCacheEntry>();

function getClientKey(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = rateLimits.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimits.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { limited: false, retryAfter: 0 };
  }

  existing.count += 1;

  if (existing.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  return { limited: false, retryAfter: 0 };
}

function getCachedSearch(key: string) {
  const cached = searchCache.get(key);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    searchCache.delete(key);
    return null;
  }

  return cached.grants;
}

function setCachedSearch(key: string, grants: Grant[]) {
  searchCache.set(key, {
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    grants,
  });
}

function getCategories(values: string[]): GrantCategory[] | "all" {
  const categories = values.filter((value): value is GrantCategory =>
    GRANT_CATEGORIES.includes(value as GrantCategory),
  );

  return categories.length > 0 ? categories : "all";
}

function getAmountRanges(values: string[]): AmountRangeFilter[] | "any" {
  const ranges = values.filter(
    (value): value is AmountRangeFilter =>
      value !== "any" && AMOUNT_RANGES.includes(value as AmountRangeFilter),
  );

  return ranges.length > 0 ? ranges : "any";
}

function getDeadlineRanges(values: string[]): DeadlineRangeFilter[] | "any" {
  const ranges = values.filter(
    (value): value is DeadlineRangeFilter =>
      value !== "any" && DEADLINE_RANGES.includes(value as DeadlineRangeFilter),
  );

  return ranges.length > 0 ? ranges : "any";
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to search grants." }, { status: 401 });
  }

  if (isGuestUser(user)) {
    return NextResponse.json(
      { error: "Create an account to search grants." },
      { status: 403 },
    );
  }

  const rateLimit = checkRateLimit(getClientKey(request));

  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many search requests. Try again shortly." },
      {
        headers: { "Retry-After": String(rateLimit.retryAfter) },
        status: 429,
      },
    );
  }

  const cacheKey = request.nextUrl.searchParams.toString();
  const cached = getCachedSearch(cacheKey);

  if (cached) {
    return NextResponse.json({ grants: cached }, { headers: CACHE_HEADERS });
  }

  const params = request.nextUrl.searchParams;
  const filters: GrantCatalogFilters = {
    search: params.get("search") ?? "",
    category: getCategories(params.getAll("category")),
    amountRange: getAmountRanges(params.getAll("amountRange")),
    deadlineRange: getDeadlineRanges(params.getAll("deadlineRange")),
  };

  const grants = (await getFilteredGrants(filters)).slice(0, MAX_SEARCH_RESULTS);
  setCachedSearch(cacheKey, grants);

  return NextResponse.json({ grants }, { headers: CACHE_HEADERS });
}
