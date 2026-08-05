import type {
  NormalizedGrantRecord,
  RejectedGrantRecord,
  RejectionReason,
  ValidationGate,
} from "../types";
import { INGESTION_THRESHOLDS, SOURCE_ALLOWLIST } from "../config";
import { normalizeUrl } from "../normalize";

function recommendedAction(reason: RejectionReason): string {
  if (["BROKEN_SOURCE_URL", "BROKEN_APPLICATION_URL", "INSUFFICIENT_VERIFICATION"].includes(reason)) {
    return "Verify against the official source before reconsidering.";
  }
  if (reason === "INVALID_RECORD") return "Review the source schema and correct the adapter only if the official API changed.";
  if (reason === "DUPLICATE") return "Compare provenance and retain the official canonical record.";
  return "Keep excluded unless the official eligibility or status changes.";
}

function rejection(
  record: NormalizedGrantRecord,
  reason: RejectionReason,
  detail: string,
): RejectedGrantRecord {
  return {
    source: record.source,
    sourceRecordId: record.sourceRecordId,
    sourceUrl: record.sourceUrl,
    grantName: record.grantName,
    funderName: record.funderName,
    reason,
    detail,
    recommendedAction: recommendedAction(reason),
    rawSourceData: record.rawSourceData,
  };
}

export function validateGrant(
  record: NormalizedGrantRecord,
  now = new Date(),
): RejectedGrantRecord | null {
  const source = SOURCE_ALLOWLIST[record.source];
  if (!source?.enabled) return rejection(record, "UNAUTHORIZED_SOURCE", "Source is disabled.");
  if (!record.nonprofitEligible) {
    return rejection(record, "NONPROFIT_NOT_ELIGIBLE", "The source does not explicitly include nonprofits.");
  }
  if (!normalizeUrl(record.sourceUrl)) {
    return rejection(record, "BROKEN_SOURCE_URL", "Source URL is not a valid HTTPS URL.");
  }
  if (!normalizeUrl(record.sourceApplicationUrl)) {
    return rejection(record, "BROKEN_APPLICATION_URL", "Application URL is not a valid HTTPS URL.");
  }
  if (record.verificationStatus !== "verified") {
    return rejection(record, "INSUFFICIENT_VERIFICATION", "Record is not verified by an approved official source.");
  }
  if (record.minimumAward !== null && record.maximumAward !== null && record.minimumAward > record.maximumAward) {
    return rejection(record, "INVALID_RECORD", "Minimum award exceeds maximum award.");
  }
  if (!record.rolling) {
    if (!record.deadline) return rejection(record, "INVALID_RECORD", "A non-rolling record has no deadline.");
    const deadline = new Date(`${record.deadline}T23:59:59.999Z`);
    if (Number.isNaN(deadline.getTime())) return rejection(record, "INVALID_RECORD", "Deadline is invalid.");
    if (deadline.getTime() <= now.getTime()) return rejection(record, "EXPIRED", "Deadline has passed.");
  }
  if (!["open", "upcoming", "rolling"].includes(record.status)) {
    return rejection(record, "EXPIRED", `Status ${record.status} is not production-visible.`);
  }
  return null;
}

export function buildValidationGates(
  accepted: NormalizedGrantRecord[],
  existingCount: number,
  unresolvedFatalErrors = 0,
): ValidationGate[] {
  const count = accepted.length;
  const percent = (matching: number) => (count === 0 ? 0 : Number(((matching / count) * 100).toFixed(2)));
  const duplicateSourceIds = count - new Set(accepted.map((record) => `${record.source}:${record.sourceRecordId}`)).size;
  const duplicateApplicationUrls = count - new Set(accepted.map((record) => record.sourceApplicationUrl)).size;
  const rowChangePercent = existingCount === 0 ? 0 : Math.abs(((count - existingCount) / existingCount) * 100);

  return [
    { name: "minimum_record_count", passed: count >= INGESTION_THRESHOLDS.minimumAcceptedRecords, actual: count, expected: `>= ${INGESTION_THRESHOLDS.minimumAcceptedRecords}`, fatal: true },
    { name: "nonprofit_eligibility", passed: percent(accepted.filter((record) => record.nonprofitEligible).length) >= INGESTION_THRESHOLDS.minimumNonprofitEligibilityPercent, actual: `${percent(accepted.filter((record) => record.nonprofitEligible).length)}%`, expected: `>= ${INGESTION_THRESHOLDS.minimumNonprofitEligibilityPercent}%`, fatal: true },
    { name: "source_url", passed: accepted.every((record) => Boolean(record.sourceUrl)), actual: `${percent(accepted.filter((record) => Boolean(record.sourceUrl)).length)}%`, expected: "100%", fatal: true },
    { name: "valid_status", passed: accepted.every((record) => ["open", "upcoming", "rolling"].includes(record.status)), actual: accepted.filter((record) => ["open", "upcoming", "rolling"].includes(record.status)).length, expected: `${count}`, fatal: true },
    { name: "future_deadline_or_rolling", passed: accepted.every((record) => record.rolling || Boolean(record.deadline)), actual: accepted.filter((record) => record.rolling || Boolean(record.deadline)).length, expected: `${count}`, fatal: true },
    { name: "duplicate_source_ids", passed: duplicateSourceIds === 0, actual: duplicateSourceIds, expected: "0", fatal: true },
    { name: "duplicate_application_urls", passed: duplicateApplicationUrls === 0, actual: duplicateApplicationUrls, expected: "0", fatal: true },
    { name: "funding_ranges", passed: accepted.every((record) => record.minimumAward === null || record.maximumAward === null || record.minimumAward <= record.maximumAward), actual: accepted.filter((record) => record.minimumAward !== null && record.maximumAward !== null && record.minimumAward > record.maximumAward).length, expected: "0 invalid", fatal: true },
    { name: "enabled_sources_only", passed: accepted.every((record) => SOURCE_ALLOWLIST[record.source]?.enabled), actual: accepted.filter((record) => !SOURCE_ALLOWLIST[record.source]?.enabled).length, expected: "0 disabled-source records", fatal: true },
    { name: "row_count_change", passed: existingCount === 0 || rowChangePercent <= INGESTION_THRESHOLDS.maximumRowCountChangePercent, actual: `${rowChangePercent.toFixed(2)}%`, expected: `<= ${INGESTION_THRESHOLDS.maximumRowCountChangePercent}%`, fatal: true },
    { name: "fatal_errors", passed: unresolvedFatalErrors === 0, actual: unresolvedFatalErrors, expected: "0", fatal: true },
  ];
}
