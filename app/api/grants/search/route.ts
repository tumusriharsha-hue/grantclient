import { NextResponse, type NextRequest } from "next/server";
import { getFilteredGrants, type GrantCatalogFilters } from "@/lib/grants/queries";
import {
  type AmountRangeFilter,
  type DeadlineRangeFilter,
} from "@/lib/grant-matching";
import { GRANT_CATEGORIES, type GrantCategory } from "@/types/grant";

const AMOUNT_RANGES = [
  "any",
  "under-25000",
  "25000-75000",
  "75000-150000",
  "over-150000",
] as const satisfies readonly AmountRangeFilter[];

const DEADLINE_RANGES = ["any", "next-30", "31-90", "over-90"] as const satisfies readonly DeadlineRangeFilter[];

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
  const params = request.nextUrl.searchParams;
  const filters: GrantCatalogFilters = {
    search: params.get("search") ?? "",
    category: getCategories(params.getAll("category")),
    amountRange: getAmountRanges(params.getAll("amountRange")),
    deadlineRange: getDeadlineRanges(params.getAll("deadlineRange")),
  };

  const grants = await getFilteredGrants(filters);

  return NextResponse.json({ grants });
}
