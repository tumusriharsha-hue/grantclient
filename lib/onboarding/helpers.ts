import type { AnnualBudgetRange } from "@/types/organization";

export function buildLocationFromStateCity(
  state?: string | null,
  city?: string | null,
): string | null {
  const trimmedState = state?.trim();
  if (!trimmedState) return null;

  const trimmedCity = city?.trim();
  if (trimmedCity) {
    return `${trimmedCity}, ${trimmedState}`;
  }

  return trimmedState;
}

export function buildMissionFromCategories(categories: string[]): string {
  if (categories.length === 0) {
    return "Organization mission pending.";
  }

  const preview = categories.slice(0, 4).join(", ");
  return `We support work in ${preview}.`;
}

export function budgetRangeToAmount(range?: AnnualBudgetRange | null): number | null {
  switch (range) {
    case "Under $50,000":
      return 40000;
    case "$50,000–$250,000":
      return 125000;
    case "$250,000–$1M":
      return 500000;
    case "Over $1M":
      return 1500000;
    default:
      return null;
  }
}

export function isOnboardingComplete(organization: {
  onboarding_completed?: boolean | null;
  onboarding_step?: number | null;
  organization_name?: string | null;
  state?: string | null;
  mission_categories?: string[] | null;
} | null): boolean {
  if (!organization) return false;
  if (organization.onboarding_completed) return true;

  if (organization.onboarding_completed === false || organization.onboarding_step) {
    return false;
  }

  return Boolean(
    organization.organization_name &&
      organization.state &&
      (organization.mission_categories?.length ?? 0) > 0,
  );
}
