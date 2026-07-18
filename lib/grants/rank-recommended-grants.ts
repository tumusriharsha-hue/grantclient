import { calculateMatchScore } from "@/lib/grants/calculate-match-score";
import { filterEligibleGrants } from "@/lib/grants/filter-grants";
import type { RecommendedGrant } from "@/lib/grants/matching-types";
import type { Organization } from "@/types/database";
import type { Grant } from "@/types/grant";

function getDeadlineData(grant: Grant, now: Date) {
  if (grant.rollingDeadline) {
    return { deadlineLabel: "Rolling", daysUntilDeadline: null };
  }
  if (!grant.deadline) {
    return { deadlineLabel: "Deadline not listed", daysUntilDeadline: null };
  }

  const deadline = new Date(`${grant.deadline}T23:59:59.999Z`);
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000);
  return {
    deadlineLabel: deadline.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
    daysUntilDeadline,
  };
}

export function rankRecommendedGrants(
  organization: Organization,
  grants: Grant[],
  options: { limit?: number; now?: Date } = {},
): RecommendedGrant[] {
  const limit = Math.max(0, Math.min(options.limit ?? 5, 25));
  const now = options.now ?? new Date();

  return filterEligibleGrants(organization, grants, now)
    .map(({ grant, eligibility }) => {
      const score = calculateMatchScore(organization, grant, eligibility, now);
      const factualFitReasons = Object.values(score.components)
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .flatMap((item) => item.reasons)
        .filter((reason, index, reasons) => reasons.indexOf(reason) === index)
        .slice(0, 3);

      return {
        ...grant,
        ...score,
        ...getDeadlineData(grant, now),
        factualFitReasons,
      };
    })
    .sort((left, right) => {
      if (right.totalScore !== left.totalScore) {
        return right.totalScore - left.totalScore;
      }
      const leftDeadline = left.daysUntilDeadline ?? Number.POSITIVE_INFINITY;
      const rightDeadline = right.daysUntilDeadline ?? Number.POSITIVE_INFINITY;
      return leftDeadline - rightDeadline;
    })
    .slice(0, limit);
}
