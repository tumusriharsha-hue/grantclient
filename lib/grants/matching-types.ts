import type { Grant } from "@/types/grant";

export type EligibilityStatus =
  | "eligible"
  | "likely_eligible"
  | "needs_verification"
  | "ineligible";

export interface EligibilityResult {
  status: EligibilityStatus;
  eligible: boolean;
  rejectionReasons: string[];
  verificationItems: string[];
}

export const MATCH_SCORE_VERSION = "v1";

export const MATCH_SCORE_WEIGHTS = {
  focusArea: 25,
  population: 20,
  geography: 15,
  fundingRange: 15,
  missionAlignment: 10,
  organizationFit: 5,
  eligibilityConfidence: 5,
  deadlinePracticality: 5,
} as const;

export type MatchComponentKey = keyof typeof MATCH_SCORE_WEIGHTS;

export interface MatchScoreComponent {
  score: number;
  maxScore: number;
  reasons: string[];
}

export type MatchScoreBreakdown = Record<MatchComponentKey, MatchScoreComponent>;

export interface MatchScoreResult {
  totalScore: number;
  components: MatchScoreBreakdown;
  eligibilityStatus: EligibilityStatus;
  verificationItems: string[];
  scoreVersion: typeof MATCH_SCORE_VERSION;
}

export interface RecommendedGrant extends Grant, MatchScoreResult {
  factualFitReasons: string[];
  deadlineLabel: string;
  daysUntilDeadline: number | null;
  explanation?: {
    summary: string;
    strengths: string[];
    caution: string | null;
  };
}
