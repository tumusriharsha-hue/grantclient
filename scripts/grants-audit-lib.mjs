import { readFileSync } from "node:fs";
import { join } from "node:path";

export const TODAY = new Date();
export const TODAY_ISO = TODAY.toISOString().slice(0, 10);

export function loadGrants() {
  return JSON.parse(readFileSync(join(process.cwd(), "data/grants.json"), "utf8"));
}

function normalizedUrl(value) {
  try { return new URL(value).href.replace(/\/$/, "").toLowerCase(); } catch { return ""; }
}

export function auditGrant(grant) {
  const issues = [];
  const deadline = grant.deadline ? new Date(`${grant.deadline}T23:59:59.999Z`) : null;
  if (grant.status === "open" && deadline && deadline < TODAY && !grant.rollingDeadline) issues.push("open_status_with_past_deadline");
  if (!grant.sourceUrl && !grant.officialUrl) issues.push("missing_official_source");
  if (!normalizedUrl(grant.applicationUrl)) issues.push("missing_or_invalid_application_url");
  if (!grant.deadline && !grant.rollingDeadline) issues.push("missing_deadline_or_rolling_evidence");
  if (!grant.eligibleOrganizationTypes?.length) issues.push("missing_eligible_organization_types");
  if (!grant.focusAreas?.length) issues.push("missing_focus_areas");
  if (!grant.eligibleLocations?.length) issues.push("missing_geography");
  if (!grant.verifiedAt) issues.push("missing_last_verified_at");
  if (!grant.nextReviewAt || new Date(grant.nextReviewAt) < TODAY) issues.push("review_due");
  if (grant.status === "open" && /invitation[- ]only|invitation[- ]based/i.test(grant.description ?? "")) issues.push("invitation_language_in_open_record");
  if (grant.status === "open" && /not accepting unsolicited|does not accept unsolicited/i.test(grant.description ?? "")) issues.push("unsolicited_applications_not_accepted");
  return { grantId: grant.id, title: grant.title, status: grant.status, issues };
}

export function buildAudit(grants) {
  const records = grants.map(auditGrant);
  const counts = Object.fromEntries(records.map((record) => [record.status, (records.filter((item) => item.status === record.status).length)]));
  const byIdentity = new Map();
  const duplicates = [];
  for (const grant of grants) {
    const identity = `${grant.funder}|${grant.title}`.toLowerCase().replace(/[^a-z0-9|]+/g, " ");
    if (byIdentity.has(identity)) duplicates.push({ grantId: grant.id, duplicateOf: byIdentity.get(identity), identity });
    else byIdentity.set(identity, grant.id);
  }
  return { generatedAt: new Date().toISOString(), total: grants.length, statusCounts: counts, records, duplicateCandidates: duplicates, requiringReview: records.filter((record) => record.issues.length > 0).length };
}
