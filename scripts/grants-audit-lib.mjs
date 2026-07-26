import { readFileSync } from "node:fs";
import { join } from "node:path";

export const TODAY = new Date();
export const TODAY_ISO = TODAY.toISOString().slice(0, 10);
const ACTIONABLE_STATUSES = new Set(["open", "upcoming", "rolling"]);

export function loadGrants() {
  return JSON.parse(readFileSync(join(process.cwd(), "data/grants.json"), "utf8"));
}

function normalizedUrl(value) {
  try { return new URL(value).href.replace(/\/$/, "").toLowerCase(); } catch { return ""; }
}

export function auditGrant(grant) {
  const issues = [];
  const deadline = grant.deadline ? new Date(`${grant.deadline}T23:59:59.999Z`) : null;
  if (["invitation_only", "no_unsolicited_applications", "recurring_unconfirmed", "expired", "archived"].includes(grant.status)) issues.push("legacy_status_enum");
  if (ACTIONABLE_STATUSES.has(grant.status) && grant.isActive === false) issues.push("actionable_status_but_inactive");
  if (ACTIONABLE_STATUSES.has(grant.status) && !grant.verifiedAt) issues.push("active_record_not_currently_verified");
  if (ACTIONABLE_STATUSES.has(grant.status) && deadline && deadline < TODAY && !grant.rollingDeadline) issues.push("actionable_status_with_past_deadline");
  if (grant.status === "rolling" && !grant.rollingDeadline) issues.push("rolling_status_without_rolling_evidence");
  if (!grant.sourceUrl && !grant.officialUrl) issues.push("missing_official_source");
  if (!normalizedUrl(grant.applicationUrl)) issues.push("missing_or_invalid_application_url");
  if (!grant.deadline && !grant.rollingDeadline) issues.push("missing_deadline_or_rolling_evidence");
  if (!grant.eligibleOrganizationTypes?.length) issues.push("missing_eligible_organization_types");
  if (!grant.focusAreas?.length) issues.push("missing_focus_areas");
  if (!grant.eligibleLocations?.length) issues.push("missing_geography");
  if (!grant.verifiedAt) issues.push("missing_last_verified_at");
  if (grant.applicationUrl && grant.officialUrl && normalizedUrl(grant.applicationUrl) === normalizedUrl(grant.officialUrl)) issues.push("application_url_equals_program_url");
  if (!grant.nextReviewAt || new Date(grant.nextReviewAt) < TODAY) issues.push("review_due");
  if (ACTIONABLE_STATUSES.has(grant.status) && /invitation[- ]only|invitation[- ]based/i.test(grant.description ?? "")) issues.push("invitation_language_in_actionable_record");
  if (ACTIONABLE_STATUSES.has(grant.status) && /not accepting unsolicited|does not accept unsolicited/i.test(grant.description ?? "")) issues.push("unsolicited_applications_not_accepted");
  return { grantId: grant.id, title: grant.title, status: grant.status, issues };
}

export function buildAudit(grants) {
  const records = grants.map(auditGrant);
  const counts = Object.fromEntries(records.map((record) => [record.status, (records.filter((item) => item.status === record.status).length)]));
  const byIdentity = new Map();
  const duplicates = [];
  const duplicateUrls = [];
  const byUrl = new Map();
  for (const grant of grants) {
    const identity = `${grant.funder}|${grant.title}`.toLowerCase().replace(/[^a-z0-9|]+/g, " ");
    if (byIdentity.has(identity)) duplicates.push({ grantId: grant.id, duplicateOf: byIdentity.get(identity), identity });
    else byIdentity.set(identity, grant.id);
    // A shared funder homepage is normal across multiple programs. Treat
    // repeated application URLs as duplicate candidates; reviewers can then
    // decide whether the programs share one portal or are duplicate records.
    for (const field of ["applicationUrl"]) {
      const url = normalizedUrl(grant[field]);
      if (!url) continue;
      if (byUrl.has(url)) duplicateUrls.push({ grantId: grant.id, duplicateOf: byUrl.get(url), field, url });
      else byUrl.set(url, grant.id);
    }
  }
  return { generatedAt: new Date().toISOString(), total: grants.length, statusCounts: counts, records, duplicateCandidates: duplicates, duplicateUrlCandidates: duplicateUrls, requiringReview: records.filter((record) => record.issues.length > 0).length };
}
