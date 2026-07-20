import { describe, expect, it } from "vitest";
import { calculateFundingFit, calculatePopulationFit } from "@/lib/grants/fit";

describe("calculatePopulationFit", () => {
  it("matches aliases and duplicates deterministically", () => {
    const result = calculatePopulationFit(["Teenagers", "Students", "Students"], ["Youth", "College Students"]);
    expect(result.status).toBe("strong_match");
    expect(result.score).toBe(100);
    expect(result.matchedPopulations).toEqual(["youth", "students"]);
  });

  it("reports partial, general, mismatch, and missing data", () => {
    expect(calculatePopulationFit(["Children", "Veterans"], ["Youth"]).status).toBe("partial_match");
    expect(calculatePopulationFit(["Children"], []).status).toBe("general");
    expect(calculatePopulationFit(["Children"], ["Seniors"]).status).toBe("mismatch");
    expect(calculatePopulationFit([], ["Youth"]).status).toBe("unknown");
  });
});

describe("calculateFundingFit", () => {
  it("returns a high positive result for either range fully containing the other", () => {
    expect(calculateFundingFit({ min: 10000, max: 50000 }, { min: 20000, max: 40000 }).status).toBe("within_range");
    expect(calculateFundingFit({ min: 20000, max: 40000 }, { min: 10000, max: 100000 }).score).toBe(100);
  });

  it("identifies overlap direction and incomplete data", () => {
    const partial = calculateFundingFit({ min: 25000, max: 75000 }, { min: 10000, max: 40000 });
    expect(partial.status).toBe("partial_overlap");
    expect(partial.overlapMinimum).toBe(25000);
    expect(partial.overlapMaximum).toBe(40000);
    expect(calculateFundingFit({ min: 50000, max: 100000 }, { min: 5000, max: 20000 }).status).toBe("below_range");
    expect(calculateFundingFit({ min: 5000, max: 15000 }, { min: 50000, max: 100000 }).status).toBe("above_range");
    expect(calculateFundingFit({ min: null, max: null }, { min: 10000, max: 20000 }).status).toBe("unknown");
  });

  it("supports zero and typical-award point ranges", () => {
    expect(calculateFundingFit({ min: 0, max: 10000 }, { min: 5000, max: 5000 }).score).toBe(100);
    expect(calculateFundingFit({ min: 25000, max: 50000 }, { min: 30000, max: 30000 }).status).toBe("within_range");
    expect(calculateFundingFit({ min: 50000, max: 100000 }, { min: 30000, max: 60000 }).status).toBe("partial_overlap");
  });
});
