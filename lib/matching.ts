import { getRegionsForState } from "@/lib/onboarding/us-states";
import {
  getGrantCategoriesForMission,
  type EnrichedGrant,
} from "@/lib/grants/enrich-grant";
import type { Organization } from "@/types/database";
import type {
  MissionCategory,
  PopulationServed,
  PreferredGrantAmount,
  PreferredGrantType,
} from "@/types/organization";

const SCORE = {
  category: 40,
  state: 25,
  population: 15,
  amount: 10,
  grantType: 10,
} as const;

export interface MatchResult {
  score: number;
  reasons: string[];
  excluded: boolean;
  exclusionReason?: string;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function getMissionCategories(organization: Organization): MissionCategory[] {
  const categories = organization.mission_categories ?? organization.keywords ?? [];
  return categories as MissionCategory[];
}

function getPopulations(organization: Organization): PopulationServed[] {
  return (organization.populations_served ?? []) as PopulationServed[];
}

function getPreferredGrantTypes(organization: Organization): PreferredGrantType[] {
  return (organization.preferred_grant_types ?? []) as PreferredGrantType[];
}

function amountMatchesPreference(
  grantAmount: number | undefined,
  preference?: PreferredGrantAmount | null,
): { points: number; matched: boolean; reason?: string } {
  if (!preference || grantAmount === undefined) {
    return { points: SCORE.amount * 0.5, matched: false };
  }

  let matched = false;

  switch (preference) {
    case "Under $5,000":
      matched = grantAmount < 5000;
      break;
    case "$5,000–$25,000":
      matched = grantAmount >= 5000 && grantAmount <= 25000;
      break;
    case "$25,000–$100,000":
      matched = grantAmount > 25000 && grantAmount <= 100000;
      break;
    case "$100,000+":
      matched = grantAmount > 100000;
      break;
  }

  return matched
    ? {
        points: SCORE.amount,
        matched: true,
        reason: "Grant amount fits your preferred funding range",
      }
    : {
        points: SCORE.amount * 0.25,
        matched: false,
        reason: "Grant amount is outside your preferred range",
      };
}

export function shouldExcludeGrant(
  organization: Organization | null,
  grant: EnrichedGrant,
): string | null {
  if (!organization) return null;

  const has501c3 = organization.has_501c3 ?? organization.is_501c3 ?? false;

  if (grant.requires501c3 && !has501c3) {
    return "Requires 501(c)(3) status";
  }

  if (grant.isGovernment && organization.accept_government_grants === false) {
    return "Government grants are disabled in your preferences";
  }

  return null;
}

function scoreCategory(organization: Organization, grant: EnrichedGrant) {
  const categories = getMissionCategories(organization);
  if (categories.length === 0) {
    return { points: 0, reason: undefined };
  }

  const expected = new Set(
    categories.flatMap((category) => getGrantCategoriesForMission(category)),
  );

  if (expected.has(grant.category)) {
    return {
      points: SCORE.category,
      reason: `Matches your ${grant.category.toLowerCase()} mission focus`,
    };
  }

  const partial = categories.some((category) => {
    const haystack = normalizeText(`${grant.title} ${grant.description}`);
    return normalizeText(category).split(/\s+/).some((word) => haystack.includes(word));
  });

  if (partial) {
    return {
      points: SCORE.category * 0.5,
      reason: "Related to one of your mission categories",
    };
  }

  return { points: 0, reason: undefined };
}

function scoreState(organization: Organization, grant: EnrichedGrant) {
  const regions = getRegionsForState(organization.state);

  if (grant.region === "National" || regions.includes(grant.region)) {
    return {
      points: SCORE.state,
      reason: organization.state
        ? `Available in ${organization.state} or nationally`
        : "National grant opportunity",
    };
  }

  return { points: SCORE.state * 0.2, reason: undefined };
}

function scorePopulation(organization: Organization, grant: EnrichedGrant) {
  const populations = getPopulations(organization);
  if (populations.length === 0) {
    return { points: 0, reason: undefined };
  }

  const overlap = populations.filter((population) =>
    grant.populations.includes(population),
  );

  if (overlap.length === 0) {
    return { points: 0, reason: undefined };
  }

  const ratio = overlap.length / populations.length;

  return {
    points: SCORE.population * Math.max(0.45, ratio),
    reason: `Serves populations you support (${overlap.slice(0, 2).join(", ")})`,
  };
}

function scoreGrantType(organization: Organization, grant: EnrichedGrant) {
  const preferred = getPreferredGrantTypes(organization);
  if (preferred.length === 0) {
    return { points: 0, reason: undefined };
  }

  const overlap = preferred.filter((type) => grant.grantTypes.includes(type));

  if (overlap.length === 0) {
    return { points: 0, reason: undefined };
  }

  return {
    points: SCORE.grantType * (overlap.length / preferred.length),
    reason: `Matches preferred grant type (${overlap[0]})`,
  };
}

function buildReasons(
  entries: Array<{ points: number; reason?: string }>,
): string[] {
  return entries
    .filter((entry) => entry.reason && entry.points > 0)
    .sort((a, b) => b.points - a.points)
    .map((entry) => entry.reason!)
    .filter((reason, index, list) => list.indexOf(reason) === index)
    .slice(0, 4);
}

function fallbackMatch(grant: EnrichedGrant): MatchResult {
  return {
    score: grant.region === "National" ? 20 : 12,
    reasons: ["Complete onboarding for personalized grant recommendations"],
    excluded: false,
  };
}

export function matchGrant(
  organization: Organization | null,
  grant: EnrichedGrant,
): MatchResult {
  if (!organization) {
    return fallbackMatch(grant);
  }

  const exclusionReason = shouldExcludeGrant(organization, grant);
  if (exclusionReason) {
    return {
      score: 0,
      reasons: [exclusionReason],
      excluded: true,
      exclusionReason,
    };
  }

  const category = scoreCategory(organization, grant);
  const state = scoreState(organization, grant);
  const population = scorePopulation(organization, grant);
  const amount = amountMatchesPreference(
    grant.amount,
    organization.preferred_grant_amount as PreferredGrantAmount | null,
  );
  const grantType = scoreGrantType(organization, grant);

  const score = clampScore(
    category.points +
      state.points +
      population.points +
      amount.points +
      grantType.points,
  );

  const reasons = buildReasons([category, state, population, amount, grantType]);

  if (reasons.length === 0) {
    reasons.push("General eligibility based on your organization profile");
  }

  return { score, reasons, excluded: false };
}

export function matchGrants(
  organization: Organization | null,
  grants: EnrichedGrant[],
): Array<EnrichedGrant & MatchResult> {
  return grants.map((grant) => ({
    ...grant,
    ...matchGrant(organization, grant),
  }));
}

export { SCORE as MATCH_SCORE_WEIGHTS };
