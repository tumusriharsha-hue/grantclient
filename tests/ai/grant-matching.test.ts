import { describe, expect, it } from "vitest";
import { calculateWeightedMatchScore, stripJsonFence } from "@/lib/ai/matching-utils";

describe("grant matching safeguards", () => {
  it("calculates the documented weighted score in application code", () => {
    expect(calculateWeightedMatchScore({ eligibility: 100, missionAlignment: 80, geographicFit: 60, fundingFit: 40, deadlineReadiness: 20, capacityFit: 0 })).toBe(67);
  });

  it("caps hard eligibility failures", () => {
    expect(calculateWeightedMatchScore({ eligibility: 0, missionAlignment: 100, geographicFit: 100, fundingFit: 100, deadlineReadiness: 100, capacityFit: 100 }, true)).toBe(20);
  });

  it("extracts fenced JSON without accepting surrounding prose", () => {
    expect(stripJsonFence("```json\n{\"matches\":[]}\n```")).toBe('{"matches":[]}');
  });
});
