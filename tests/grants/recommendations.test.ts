import { describe, expect, it } from "vitest";
import { rankRecommendedGrants } from "@/lib/grants/rank-recommended-grants";
import { makeGrant, NOW, organization } from "./fixtures";

describe("rankRecommendedGrants", () => {
  it("sorts by score and uses deadline as a tie breaker", () => {
    const later = makeGrant({ id: "later", deadline: "2026-12-01" });
    const sooner = makeGrant({ id: "sooner", deadline: "2026-10-01" });
    const results = rankRecommendedGrants(organization, [later, sooner], { now: NOW });
    expect(results.map((grant) => grant.id)).toEqual([sooner.id, later.id]);
  });

  it("returns no more than five grants", () => {
    const grants = Array.from({ length: 8 }, (_, index) =>
      makeGrant({ id: `grant-${index}` }),
    );
    expect(rankRecommendedGrants(organization, grants, { now: NOW })).toHaveLength(5);
  });

  it("returns fewer than five when only fewer grants qualify", () => {
    const valid = makeGrant({ id: "valid" });
    const expired = makeGrant({ id: "expired", deadline: "2026-01-01" });
    expect(rankRecommendedGrants(organization, [valid, expired], { now: NOW })).toHaveLength(1);
  });
});
