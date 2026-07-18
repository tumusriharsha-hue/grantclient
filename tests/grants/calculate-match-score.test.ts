import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "@/lib/grants/calculate-match-score";
import { filterGrantEligibility } from "@/lib/grants/filter-grants";
import { MATCH_SCORE_WEIGHTS } from "@/lib/grants/matching-types";
import { makeGrant, NOW, organization } from "./fixtures";

describe("calculateMatchScore", () => {
  it("is deterministic and bounded", () => {
    const grant = makeGrant();
    const eligibility = filterGrantEligibility(organization, grant, NOW);
    const first = calculateMatchScore(organization, grant, eligibility, NOW);
    const second = calculateMatchScore(organization, grant, eligibility, NOW);
    expect(first).toEqual(second);
    expect(first.totalScore).toBeGreaterThanOrEqual(0);
    expect(first.totalScore).toBeLessThanOrEqual(100);
    for (const item of Object.values(first.components)) {
      expect(item.score).toBeLessThanOrEqual(item.maxScore);
    }
  });

  it("defines weights totaling 100", () => {
    expect(Object.values(MATCH_SCORE_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it("ranks an exact profile fit above a weak fit", () => {
    const exact = makeGrant();
    const weak = makeGrant({
      id: "weak",
      category: "Arts & Culture",
      focusAreas: ["Arts & Culture"],
      populationsServed: ["Seniors"],
      description: "Supports preservation of regional musical archives.",
    });
    const exactScore = calculateMatchScore(
      organization,
      exact,
      filterGrantEligibility(organization, exact, NOW),
      NOW,
    );
    const weakScore = calculateMatchScore(
      organization,
      weak,
      filterGrantEligibility(organization, weak, NOW),
      NOW,
    );
    expect(exactScore.totalScore).toBeGreaterThan(weakScore.totalScore);
  });

  it("reduces confidence when eligibility facts are missing", () => {
    const grant = makeGrant({ deadline: undefined, rollingDeadline: false, verifiedAt: undefined });
    const result = calculateMatchScore(
      organization,
      grant,
      filterGrantEligibility(organization, grant, NOW),
      NOW,
    );
    expect(result.eligibilityStatus).toBe("needs_verification");
    expect(result.components.eligibilityConfidence.score).toBeLessThan(5);
  });
});
