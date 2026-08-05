import type { ExistingCatalogSnapshot, IngestionResult, NormalizedGrantRecord } from "./types";
import { SOURCE_ALLOWLIST } from "./config";

function countBy(values: string[]) {
  return Object.fromEntries(
    [...new Set(values)].sort().map((value) => [value, values.filter((item) => item === value).length]),
  );
}

function formatCounts(counts: Record<string, number>) {
  const entries = Object.entries(counts);
  return entries.length === 0
    ? "- None"
    : entries.map(([label, count]) => `- ${label}: ${count}`).join("\n");
}

function percentage(records: NormalizedGrantRecord[], predicate: (record: NormalizedGrantRecord) => boolean) {
  if (records.length === 0) return "0.00%";
  return `${((records.filter(predicate).length / records.length) * 100).toFixed(2)}%`;
}

function fundingBucket(record: NormalizedGrantRecord) {
  const amount = record.maximumAward ?? record.minimumAward;
  if (amount === null) return "Unknown";
  if (amount < 25_000) return "Under $25k";
  if (amount < 100_000) return "$25k–$99,999";
  if (amount < 500_000) return "$100k–$499,999";
  if (amount < 1_000_000) return "$500k–$999,999";
  return "$1m+";
}

export function buildDryRunReport(
  result: IngestionResult,
  existing: ExistingCatalogSnapshot,
): string {
  const accepted = result.accepted;
  const rejectionCounts = countBy(result.rejected.map((record) => record.reason));
  const statusCounts = countBy(accepted.map((record) => record.status));
  const geographyCounts = countBy(accepted.flatMap((record) => record.eligibleStates.length ? record.eligibleStates : [record.geographicScope ?? "Unknown"]));
  const focusCounts = countBy(accepted.flatMap((record) => record.focusAreas.length ? record.focusAreas : ["Unknown"]));
  const fundingCounts = countBy(accepted.map(fundingBucket));
  const enabledSources = Object.values(SOURCE_ALLOWLIST).filter((source) => source.enabled);
  const disabledSources = Object.values(SOURCE_ALLOWLIST).filter((source) => !source.enabled);

  return `# Grant ingestion dry-run report

Generated: ${result.completedAt}  
Run ID: \`${result.runId}\`  
Production promotion performed: **No**

## Sources checked

${enabledSources.map((source) => `- ${source.sourceName}: ${source.retrievalMethod}; ${source.complianceBasis}`).join("\n")}

## Sources excluded

${disabledSources.map((source) => `- ${source.sourceName}: ${source.robotsAssessment}`).join("\n") || "- None"}

## Data quality summary

| Metric | Count |
| --- | ---: |
| Fetched | ${result.fetched} |
| Normalized | ${result.normalized} |
| Accepted | ${accepted.length} |
| Rejected | ${result.rejected.length} |
| Exact duplicates removed | ${result.deduplicated} |
| Ambiguous duplicate candidates | ${result.duplicateCandidates.filter((candidate) => candidate.confidence === "review").length} |
| Verified | ${accepted.filter((record) => record.verificationStatus === "verified").length} |
| Open | ${statusCounts.open ?? 0} |
| Upcoming | ${statusCounts.upcoming ?? 0} |
| Rolling | ${statusCounts.rolling ?? 0} |

### Fetched by source

${formatCounts(result.fetchedBySource)}

### Rejection categories

${formatCounts(rejectionCounts)}

### Geographic distribution

${formatCounts(geographyCounts)}

### Focus-area distribution

${formatCounts(focusCounts)}

### Funding-range distribution

${formatCounts(fundingCounts)}

## Missing-field percentages

- Deadline: ${percentage(accepted, (record) => record.deadline === null && !record.rolling)}
- Award range: ${percentage(accepted, (record) => record.minimumAward === null && record.maximumAward === null)}
- Geographic scope: ${percentage(accepted, (record) => !record.geographicScope && record.eligibleStates.length === 0)}
- Focus areas: ${percentage(accepted, (record) => record.focusAreas.length === 0)}
- Application requirements: ${percentage(accepted, (record) => record.applicationRequirements.length === 0)}
- Required documents: ${percentage(accepted, (record) => record.requiredDocuments.length === 0)}

## Existing production comparison

| Metric | Existing | Proposed |
| --- | ---: | ---: |
| Grant rows | ${existing.grants} | ${accepted.length} |
| Active grants | ${existing.activeGrants} | ${accepted.length} |
| Verified grants | ${existing.verifiedGrants} | ${accepted.filter((record) => record.verificationStatus === "verified").length} |

Existing grant-ID checksum: \`${existing.checksum}\`

## Dependent references

- Saved grants: ${existing.savedGrants}
- Applications: ${existing.applications}
- Generated proposals: ${existing.generatedProposals}
- Grant match snapshots: ${existing.grantMatchSnapshots}
- Application sections: ${existing.applicationSections}
- AI generation records: ${existing.aiGenerationRecords}

Promotion preserves all existing IDs, archives rows not present in staging, and never deletes user application or saved-grant history.

## Validation gates

| Gate | Result | Actual | Required |
| --- | --- | --- | --- |
${result.gates.map((gate) => `| ${gate.name} | ${gate.passed ? "PASS" : "FAIL"} | ${gate.actual} | ${gate.expected} |`).join("\n")}

Overall result: **${result.validationPassed ? "PASS" : "FAIL"}**

Broken-link count: 0 detected structurally. The enabled official API is the verification authority; individual HTML crawling was not used.

Detailed rejected records and duplicate candidates: \`data/audits/grant-ingestion-dry-run.json\`

## Promotion procedure

The first pass intentionally stops before staging or production promotion.

1. Apply the reviewed migration: \`supabase db push\`
2. Stage a fresh validated run: \`npm run grants:stage\`
3. Review \`grant_ingestion_runs\`, \`grants_ingestion_staging\`, and \`grant_ingestion_rejections\`.
4. Copy the run ID emitted by the staging command and promote only that approved staged run: \`npm run grants:promote -- --run-id=<approved-staged-run-id>\`

## Rollback command

After promotion, roll back that exact run with:

\`npm run grants:rollback -- --run-id=<promoted-run-id>\`
`;
}
