import { getRegionsForState } from "@/lib/onboarding/us-states";
import {
  getDesiredFundingRange,
  getGrantAwardRange,
} from "@/lib/grants/filter-grants";
import {
  MATCH_SCORE_VERSION,
  MATCH_SCORE_WEIGHTS,
  type EligibilityResult,
  type MatchScoreComponent,
  type MatchScoreResult,
} from "@/lib/grants/matching-types";
import type { Organization } from "@/types/database";
import type { Grant } from "@/types/grant";
import { getGrantCategoriesForMission } from "@/lib/grants/enrich-grant";
import { MISSION_CATEGORIES, type MissionCategory } from "@/types/organization";

const STOP_WORDS = new Set([
  "about", "after", "also", "and", "are", "for", "from", "into", "our", "that",
  "the", "their", "this", "through", "with", "will", "your", "grant", "program",
]);

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function component(maxScore: number, score: number, reasons: string[]): MatchScoreComponent {
  return { maxScore, score: clamp(score, maxScore), reasons };
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(values: Array<string | null | undefined>): Set<string> {
  return new Set(
    values
      .filter((value): value is string => Boolean(value))
      .flatMap((value) => normalize(value).split(/\s+/))
      .filter((word) => word.length >= 3 && !STOP_WORDS.has(word)),
  );
}

function overlap(left: Set<string>, right: Set<string>): string[] {
  return [...left].filter((value) => right.has(value));
}

function scoreFocus(organization: Organization, grant: Grant): MatchScoreComponent {
  const orgTags = organization.mission_categories ?? organization.keywords ?? [];
  const grantTags = grant.focusAreas?.length ? grant.focusAreas : [grant.category];
  const exact = grantTags.filter((tag) =>
    orgTags.some((orgTag) => normalize(orgTag) === normalize(tag)),
  );
  if (exact.length > 0) {
    const ratio = exact.length / Math.max(orgTags.length, grantTags.length);
    return component(25, 15 + ratio * 10, exact.slice(0, 3));
  }
  const mappedCategories = new Set(
    orgTags
      .filter((tag): tag is MissionCategory =>
        MISSION_CATEGORIES.includes(tag as MissionCategory),
      )
      .flatMap(getGrantCategoriesForMission),
  );
  if (mappedCategories.has(grant.category)) {
    return component(25, 18, [`Mapped mission fit: ${grant.category}`]);
  }
  const shared = overlap(tokens(orgTags), tokens(grantTags));
  return component(25, shared.length > 0 ? 10 : 0, shared.slice(0, 3));
}

function scorePopulation(organization: Organization, grant: Grant): MatchScoreComponent {
  const orgTags = organization.populations_served ?? [];
  const grantTags = grant.populationsServed ?? [];
  if (orgTags.length === 0 || grantTags.length === 0) {
    return component(20, 0, []);
  }
  const matches = grantTags.filter((tag) =>
    orgTags.some((orgTag) => normalize(orgTag) === normalize(tag)),
  );
  return component(
    20,
    20 * (matches.length / Math.max(orgTags.length, grantTags.length)),
    matches.slice(0, 3),
  );
}

function scoreGeography(organization: Organization, grant: Grant): MatchScoreComponent {
  const eligible = grant.eligibleLocations?.length
    ? grant.eligibleLocations
    : grant.region
      ? [grant.region]
      : [];
  if (eligible.length === 0) return component(15, 0, []);
  if (eligible.some((item) => ["national", "nationwide", "united states", "us"].includes(normalize(item)))) {
    return component(15, 15, ["National eligibility"]);
  }
  const locations = [
    organization.state,
    ...(organization.geographic_service_area ?? []),
    ...(organization.state ? getRegionsForState(organization.state) : []),
  ].filter((value): value is string => Boolean(value));
  const matches = eligible.filter((item) =>
    locations.some((location) => normalize(location) === normalize(item)),
  );
  return component(15, matches.length > 0 ? 15 : 0, matches.slice(0, 2));
}

function scoreFunding(organization: Organization, grant: Grant): MatchScoreComponent {
  const desired = getDesiredFundingRange(organization);
  const award = getGrantAwardRange(grant);
  if (
    (desired.min === null && desired.max === null) ||
    (award.min === null && award.max === null)
  ) {
    return component(15, 0, []);
  }
  const desiredMin = desired.min ?? 0;
  const desiredMax = desired.max ?? Math.max(award.max ?? award.min ?? desiredMin, desiredMin);
  const awardMin = award.min ?? 0;
  const awardMax = award.max ?? Math.max(desiredMax, awardMin);
  const intersection = Math.max(0, Math.min(desiredMax, awardMax) - Math.max(desiredMin, awardMin));
  const union = Math.max(desiredMax, awardMax) - Math.min(desiredMin, awardMin);
  const ratio = union === 0 ? 1 : intersection / union;
  return component(15, ratio > 0 ? 8 + ratio * 7 : 0, ratio > 0 ? ["Funding ranges overlap"] : []);
}

function scoreMission(organization: Organization, grant: Grant): MatchScoreComponent {
  const organizationTerms = tokens([
    organization.mission,
    ...(organization.programs ?? []),
    ...(organization.mission_categories ?? []),
  ]);
  const grantTerms = tokens([
    grant.title,
    grant.description,
    grant.eligibilitySummary,
    ...(grant.focusAreas ?? []),
  ]);
  const shared = overlap(organizationTerms, grantTerms);
  const denominator = Math.max(1, Math.min(10, organizationTerms.size));
  return component(10, 10 * Math.min(1, shared.length / denominator), shared.slice(0, 5));
}

function scoreOrganizationFit(organization: Organization, grant: Grant): MatchScoreComponent {
  if (organization.budget === null) return component(5, 0, []);
  const hasRestriction =
    grant.minimumAnnualBudget !== undefined || grant.maximumAnnualBudget !== undefined;
  if (!hasRestriction) return component(5, 2, ["No organization-size restriction listed"]);
  const fitsMin = grant.minimumAnnualBudget === undefined || organization.budget >= grant.minimumAnnualBudget;
  const fitsMax = grant.maximumAnnualBudget === undefined || organization.budget <= grant.maximumAnnualBudget;
  return component(5, fitsMin && fitsMax ? 5 : 0, fitsMin && fitsMax ? ["Annual budget fits the listed range"] : []);
}

function scoreConfidence(eligibility: EligibilityResult): MatchScoreComponent {
  const scores = { eligible: 5, likely_eligible: 4, needs_verification: 2, ineligible: 0 };
  return component(
    5,
    scores[eligibility.status],
    eligibility.verificationItems.length === 0 ? ["Eligibility fields are complete"] : [],
  );
}

function scoreDeadline(grant: Grant, now: Date): MatchScoreComponent {
  if (grant.rollingDeadline) return component(5, 5, ["Rolling deadline"]);
  if (!grant.deadline) return component(5, 0, []);
  const days = Math.ceil(
    (new Date(`${grant.deadline}T23:59:59.999Z`).getTime() - now.getTime()) / 86_400_000,
  );
  const score = days > 60 ? 5 : days > 30 ? 4 : days > 14 ? 3 : days > 7 ? 2 : 1;
  return component(5, score, [`${Math.max(0, days)} days until deadline`]);
}

export function calculateMatchScore(
  organization: Organization,
  grant: Grant,
  eligibility: EligibilityResult,
  now = new Date(),
): MatchScoreResult {
  const components = {
    focusArea: scoreFocus(organization, grant),
    population: scorePopulation(organization, grant),
    geography: scoreGeography(organization, grant),
    fundingRange: scoreFunding(organization, grant),
    missionAlignment: scoreMission(organization, grant),
    organizationFit: scoreOrganizationFit(organization, grant),
    eligibilityConfidence: scoreConfidence(eligibility),
    deadlinePracticality: scoreDeadline(grant, now),
  };
  const totalScore = clamp(
    Object.values(components).reduce((sum, item) => sum + item.score, 0),
    Object.values(MATCH_SCORE_WEIGHTS).reduce((sum, weight) => sum + weight, 0),
  );
  return {
    totalScore,
    components,
    eligibilityStatus: eligibility.status,
    verificationItems: eligibility.verificationItems,
    scoreVersion: MATCH_SCORE_VERSION,
  };
}
