import { canonicalText, normalizeUrl } from "../normalize";
import type { DuplicateCandidate, NormalizedGrantRecord } from "../types";

function fingerprint(record: NormalizedGrantRecord): string {
  return [record.funderName, record.grantName, record.deadline ?? "rolling", record.geographicScope ?? ""]
    .map(canonicalText)
    .join("|");
}

export function deduplicateGrants(records: NormalizedGrantRecord[]): {
  records: NormalizedGrantRecord[];
  duplicates: DuplicateCandidate[];
} {
  const accepted: NormalizedGrantRecord[] = [];
  const duplicates: DuplicateCandidate[] = [];
  const exact = new Map<string, string>();
  const reviewFingerprints = new Map<string, string>();

  for (const record of records) {
    const keys: Array<[DuplicateCandidate["method"], string | null]> = [
      ["source_record_id", `${record.source}:${record.sourceRecordId}`],
      ["source_url", normalizeUrl(record.sourceUrl)],
      ["application_url", normalizeUrl(record.sourceApplicationUrl)],
    ];
    const duplicate = keys.find(([, key]) => key && exact.has(key));
    if (duplicate?.[1]) {
      duplicates.push({ recordId: record.id, duplicateOf: exact.get(duplicate[1])!, method: duplicate[0], confidence: "exact" });
      continue;
    }

    for (const [, key] of keys) if (key) exact.set(key, record.id);
    const candidateFingerprint = fingerprint(record);
    const possibleDuplicate = reviewFingerprints.get(candidateFingerprint);
    if (possibleDuplicate) {
      duplicates.push({ recordId: record.id, duplicateOf: possibleDuplicate, method: "fingerprint", confidence: "review" });
    } else {
      reviewFingerprints.set(candidateFingerprint, record.id);
    }
    accepted.push(record);
  }

  return { records: accepted, duplicates };
}
