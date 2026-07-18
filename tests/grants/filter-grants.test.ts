import { describe, expect, it } from "vitest";
import { filterGrantEligibility } from "@/lib/grants/filter-grants";
import { makeGrant, NOW, organization } from "./fixtures";

describe("filterGrantEligibility", () => {
  it("excludes an expired grant", () => {
    const result = filterGrantEligibility(
      organization,
      makeGrant({ deadline: "2026-07-01" }),
      NOW,
    );
    expect(result.eligible).toBe(false);
    expect(result.rejectionReasons).toContain("Application deadline has passed");
  });

  it("retains a rolling grant without a deadline", () => {
    const result = filterGrantEligibility(
      organization,
      makeGrant({ deadline: undefined, rollingDeadline: true }),
      NOW,
    );
    expect(result.eligible).toBe(true);
  });

  it("excludes a clear geography mismatch", () => {
    const result = filterGrantEligibility(
      organization,
      makeGrant({ eligibleLocations: ["California"], region: "Western US" }),
      NOW,
    );
    expect(result.eligible).toBe(false);
  });

  it("excludes a nonprofit-status mismatch", () => {
    const result = filterGrantEligibility(
      { ...organization, has_501c3: false, is_501c3: false, nonprofit_status: "nonprofit" },
      makeGrant(),
      NOW,
    );
    expect(result.eligible).toBe(false);
  });

  it("does not reject a missing optional restriction", () => {
    const result = filterGrantEligibility(
      organization,
      makeGrant({
        eligibleOrganizationTypes: undefined,
        requiredNonprofitStatus: undefined,
        minimumAnnualBudget: undefined,
        maximumAnnualBudget: undefined,
      }),
      NOW,
    );
    expect(result.eligible).toBe(true);
  });
});
