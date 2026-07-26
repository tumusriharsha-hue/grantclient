import type { Grant, GrantStatus } from "@/types/grant";

export const ACTIONABLE_GRANT_STATUSES: GrantStatus[] = ["open", "upcoming", "rolling"];

export function isActionableGrant(grant: Grant, now = new Date()) {
  if (!ACTIONABLE_GRANT_STATUSES.includes(grant.status)) return false;
  if (grant.isActive === false) return false;
  if (grant.invitationOnly || grant.status === "invite_only") return false;
  if (grant.status === "rolling" && !grant.rollingDeadline) return false;
  // Imported local records must have a recorded verification before discovery.
  // External government/catalog adapters may not carry local verification metadata.
  if (grant.sourceUrl && !grant.verifiedAt) return false;
  if (grant.deadline && !grant.rollingDeadline) {
    const deadline = new Date(`${grant.deadline}T23:59:59.999Z`);
    if (!Number.isNaN(deadline.getTime()) && deadline.getTime() < now.getTime()) return false;
  }
  return true;
}
