import type { Grant } from "@/types/grant";
import type { Organization } from "@/types/database";
import { filterGrantEligibility } from "@/lib/grants/filter-grants";
import { calculateMatchScore } from "@/lib/grants/calculate-match-score";
import { candidateGrantSchema, organizationProfileSchema, grantMatchingResponseSchema, type GrantMatchingResponse } from "@/lib/ai/schemas";
import { aiProvider } from "@/lib/ai/provider";
import { truncateForModel } from "@/lib/ai/limits";
import { stripJsonFence } from "@/lib/ai/matching-utils";
import { calculateFundingFit, calculatePopulationFit } from "@/lib/grants/fit";
import { getGrantAwardRange } from "@/lib/grants/filter-grants";

export const GRANT_MATCHING_PROMPT_VERSION = "grant-matching-v1";
export { calculateWeightedMatchScore, MATCH_WEIGHTS, stripJsonFence } from "@/lib/ai/matching-utils";

export function selectGrantCandidates(organization: Organization, grants: Grant[], limit = 12, now = new Date()) {
  return grants
    .map((grant) => ({ grant, eligibility: filterGrantEligibility(organization, grant, now) }))
    .filter(({ eligibility }) => eligibility.eligible)
    .sort((a, b) => (b.eligibility.status === "eligible" ? 1 : 0) - (a.eligibility.status === "eligible" ? 1 : 0))
    .slice(0, Math.max(1, Math.min(limit, 15)));
}

export function buildMatchingPrompt(organization: Organization, candidates: Array<{ grant: Grant; eligibility: ReturnType<typeof filterGrantEligibility> }>) {
  const profile = organizationProfileSchema.parse({
    name: organization.organization_name, mission: truncateForModel(organization.mission, 1500), programs: organization.programs ?? [], focusAreas: organization.mission_categories ?? organization.keywords ?? [], geography: [organization.city, organization.state, organization.country, ...(organization.geographic_service_area ?? [])].filter((x): x is string => Boolean(x)), organizationType: organization.organization_type, nonprofitStatus: organization.nonprofit_status, budget: organization.budget, fundingNeed: organization.funding_needs, preferredGrantSize: organization.preferred_grant_amount, populationServed: organization.populations_served ?? [], fundingMinimum: organization.requested_funding_min, fundingMaximum: organization.requested_funding_max,
  });
  return { profile, candidates: candidates.map(({ grant }) => candidateGrantSchema.parse({ grantId: grant.id, title: grant.title, funder: grant.funder, description: truncateForModel(grant.description, 1200), category: grant.category, locations: grant.eligibleLocations ?? [grant.region], eligibility: grant.eligibilitySummary ?? null, awardMin: grant.awardMin ?? grant.amount ?? null, awardMax: grant.awardMax ?? grant.amount ?? null, deadline: grant.deadline ?? null, rollingDeadline: Boolean(grant.rollingDeadline), focusAreas: grant.focusAreas ?? [], populationsServed: grant.populationsServed ?? [], calculatedResults: { populationFit: calculatePopulationFit(profile.populationServed, grant.populationsServed ?? []), fundingFit: calculateFundingFit({ min: profile.fundingMinimum, max: profile.fundingMaximum }, getGrantAwardRange(grant)) }, })), version: GRANT_MATCHING_PROMPT_VERSION };
}

export async function generateGrantMatches(organization: Organization, candidates: Array<{ grant: Grant; eligibility: ReturnType<typeof filterGrantEligibility> }>): Promise<GrantMatchingResponse> {
  const request = buildMatchingPrompt(organization, candidates);
  const result = await aiProvider.generateStructured({
    schemaName: "grant-matching-response",
    messages: [
      { role: "system", content: "You are a grant matching analyst. Use only supplied facts. Never invent requirements, deadlines, awards, eligibility, or organization facts. Return JSON only with matches. Grant IDs must come from candidates. Scores are 0-100 component estimates; do not return a final score. The supplied calculatedResults.populationFit and calculatedResults.fundingFit are deterministic and authoritative: preserve their statuses and scores in your explanation, and never override or recalculate them. Hard eligibility conflicts are not strong matches. Every explanation must be traceable to supplied fields. State when information is missing." },
      { role: "user", content: JSON.stringify(request) },
    ], maxTokens: 1200,
    parse: (content) => grantMatchingResponseSchema.parse(JSON.parse(stripJsonFence(content))),
  });
  const allowed = new Set(candidates.map(({ grant }) => grant.id));
  const seen = new Set<string>();
  if (result.matches.some((match) => !allowed.has(match.grantId) || seen.has(match.grantId) || (seen.add(match.grantId), false))) throw new Error("invalid_match_ids");
  return result;
}

export function toAiMatch(match: GrantMatchingResponse["matches"][number], organization: Organization, candidate: { grant: Grant; eligibility: ReturnType<typeof filterGrantEligibility> }) {
  const deterministic = calculateMatchScore(organization, candidate.grant, candidate.eligibility);
  return { ...match, finalScore: deterministic.totalScore, deterministicScore: deterministic, grant: candidate.grant, eligibility: candidate.eligibility };
}

// Kept as a small import-time guard for callers that want schema validation without a provider call.
export const deterministicScoreForCandidate = (organization: Organization, grant: Grant, now = new Date()) => {
  const eligibility = filterGrantEligibility(organization, grant, now);
  return calculateMatchScore(organization, grant, eligibility, now);
};
