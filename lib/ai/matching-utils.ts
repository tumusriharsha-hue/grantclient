export const MATCH_WEIGHTS = { eligibility: 0.30, missionAlignment: 0.25, geographicFit: 0.15, fundingFit: 0.15, deadlineReadiness: 0.10, capacityFit: 0.05 } as const;

export function calculateWeightedMatchScore(scores: { eligibility: number; missionAlignment: number; geographicFit: number; fundingFit: number; deadlineReadiness: number; capacityFit: number }, hardEligibilityFailure = false) {
  const value = Math.round((scores.eligibility * MATCH_WEIGHTS.eligibility + scores.missionAlignment * MATCH_WEIGHTS.missionAlignment + scores.geographicFit * MATCH_WEIGHTS.geographicFit + scores.fundingFit * MATCH_WEIGHTS.fundingFit + scores.deadlineReadiness * MATCH_WEIGHTS.deadlineReadiness + scores.capacityFit * MATCH_WEIGHTS.capacityFit) * 100) / 100;
  return hardEligibilityFailure ? Math.min(value, 20) : Math.max(0, Math.min(100, value));
}

export function stripJsonFence(content: string) {
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (match?.[1] ?? content).trim();
}
