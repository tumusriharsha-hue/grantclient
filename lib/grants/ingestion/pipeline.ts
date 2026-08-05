import { californiaGrantsPortalAdapter } from "./adapters/california-grants-portal";
import { simplerGrantsGovAdapter } from "./adapters/simpler-grants-gov";
import { deduplicateGrants } from "./deduplicate";
import { buildValidationGates, validateGrant } from "./validate";
import type {
  ExistingCatalogSnapshot,
  GrantSourceAdapter,
  IngestionResult,
  RejectedGrantRecord,
} from "./types";

export const GRANT_SOURCE_ADAPTERS: GrantSourceAdapter[] = [
  simplerGrantsGovAdapter,
  californiaGrantsPortalAdapter,
];

export async function runIngestion({
  existingCatalog,
  sourceName,
  limit,
  now = new Date(),
}: {
  existingCatalog: ExistingCatalogSnapshot;
  sourceName?: string;
  limit?: number;
  now?: Date;
}): Promise<IngestionResult> {
  const startedAt = new Date().toISOString();
  const runId = crypto.randomUUID();
  const configured = sourceName
    ? GRANT_SOURCE_ADAPTERS.filter((adapter) => adapter.sourceName === sourceName)
    : GRANT_SOURCE_ADAPTERS.filter((adapter) => adapter.compliance.enabled);

  if (configured.length === 0) throw new Error(`No enabled source matched ${sourceName ?? "the allowlist"}.`);
  if (configured.some((adapter) => !adapter.compliance.enabled)) {
    throw new Error(`Source ${sourceName} is disabled by the compliance allowlist.`);
  }

  const fetchedBySource: Record<string, number> = {};
  const normalizedRecords = [];
  const rejected: RejectedGrantRecord[] = [];
  let unresolvedFatalErrors = 0;

  for (const adapter of configured) {
    try {
      const records = await adapter.fetchRecords({ limit });
      fetchedBySource[adapter.sourceName] = records.length;
      for (const rawRecord of records) {
        const normalized = await adapter.normalize(rawRecord, now);
        if (!normalized) {
          rejected.push({
            source: adapter.sourceName,
            sourceRecordId: typeof rawRecord.opportunity_id === "string" ? rawRecord.opportunity_id : null,
            sourceUrl: typeof rawRecord.opportunity_id === "string"
              ? `https://simpler.grants.gov/opportunity/${encodeURIComponent(rawRecord.opportunity_id)}`
              : null,
            grantName: typeof rawRecord.opportunity_title === "string" ? rawRecord.opportunity_title : null,
            funderName: typeof rawRecord.agency_name === "string" ? rawRecord.agency_name : null,
            reason: "INVALID_RECORD",
            detail: "The source record did not match the documented schema.",
            recommendedAction: "Review the official API schema before changing the adapter.",
            rawSourceData: rawRecord,
          });
          continue;
        }
        const validationFailure = validateGrant(normalized, now);
        if (validationFailure) rejected.push(validationFailure);
        else normalizedRecords.push(normalized);
      }
    } catch (error) {
      unresolvedFatalErrors += 1;
      fetchedBySource[adapter.sourceName] = 0;
      rejected.push({
        source: adapter.sourceName,
        sourceRecordId: null,
        sourceUrl: null,
        grantName: null,
        funderName: null,
        reason: "INVALID_RECORD",
        detail: error instanceof Error ? error.message : "Unknown source error",
        recommendedAction: "Resolve the source error and rerun; do not promote a partial catalog.",
        rawSourceData: {},
      });
    }
  }

  const deduplication = deduplicateGrants(normalizedRecords);
  const exactDuplicateIds = new Set(
    deduplication.duplicates
      .filter((duplicate) => duplicate.confidence === "exact")
      .map((duplicate) => duplicate.recordId),
  );
  const accepted = deduplication.records.filter((record) => !exactDuplicateIds.has(record.id));
  const gates = buildValidationGates(accepted, existingCatalog.grants, unresolvedFatalErrors);

  return {
    runId,
    startedAt,
    completedAt: new Date().toISOString(),
    sourcesAttempted: configured.map((adapter) => adapter.sourceName),
    fetchedBySource,
    fetched: Object.values(fetchedBySource).reduce((total, count) => total + count, 0),
    normalized: normalizedRecords.length,
    accepted,
    rejected,
    duplicateCandidates: deduplication.duplicates,
    deduplicated: exactDuplicateIds.size,
    gates,
    validationPassed: gates.filter((gate) => gate.fatal).every((gate) => gate.passed),
  };
}
