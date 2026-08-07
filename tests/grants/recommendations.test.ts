import { describe, expect, it } from "vitest";
import { rankRecommendedGrants } from "@/lib/grants/rank-recommended-grants";
import { makeGrant, NOW, organization } from "./fixtures";

describe("rankRecommendedGrants", () => {
  it("ranks grants with more time to prepare higher", () => {
    const later = makeGrant({ id: "later", deadline: "2026-12-01" });
    const sooner = makeGrant({ id: "sooner", deadline: "2026-10-01" });
    const results = rankRecommendedGrants(organization, [later, sooner], { now: NOW });
    expect(results.map((grant) => grant.id)).toEqual([later.id, sooner.id]);
  });

  it("returns no more than five grants", () => {
    const grants = Array.from({ length: 8 }, (_, index) =>
      makeGrant({ id: `grant-${index}` }),
    );
    expect(rankRecommendedGrants(organization, grants, { now: NOW })).toHaveLength(5);
  });

  it("spreads otherwise equal recommendation scores by rank", () => {
    const grants = Array.from({ length: 5 }, (_, index) =>
      makeGrant({
        id: `equal-${index}`,
        description: "Supports community programs.",
        deadline: undefined,
        rollingDeadline: true,
      }),
    );
    const results = rankRecommendedGrants(organization, grants, { now: NOW });
    const scores = results.map((grant) => grant.totalScore);

    expect(new Set(scores).size).toBe(5);
    expect(scores).toEqual([...scores].sort((left, right) => right - left));
    expect(scores[0] - scores.at(-1)!).toBeGreaterThanOrEqual(7);
  });

  it("returns fewer than five when only fewer grants qualify", () => {
    const valid = makeGrant({ id: "valid" });
    const expired = makeGrant({ id: "expired", deadline: "2026-01-01" });
    expect(rankRecommendedGrants(organization, [valid, expired], { now: NOW })).toHaveLength(1);
  });

  it("excludes inactive and unverified catalog records", () => {
    const inactive = makeGrant({ id: "inactive", isActive: false });
    const unverified = makeGrant({
      id: "unverified",
      sourceUrl: "https://example.org/program",
      verifiedAt: undefined,
    });
    expect(rankRecommendedGrants(organization, [inactive, unverified], { now: NOW })).toHaveLength(0);
  });

  it("does not treat a non-rolling record as rolling", () => {
    const mislabeled = makeGrant({
      id: "mislabeled",
      status: "rolling",
      deadline: undefined,
      rollingDeadline: false,
    });
    expect(rankRecommendedGrants(organization, [mislabeled], { now: NOW })).toHaveLength(0);
  });
});
