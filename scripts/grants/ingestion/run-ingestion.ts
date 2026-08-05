import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildDryRunReport } from "../../../lib/grants/ingestion/report";
import { runIngestion } from "../../../lib/grants/ingestion/pipeline";
import {
  promoteIngestion,
  readExistingCatalogSnapshot,
  rollbackIngestion,
  stageIngestion,
} from "../../../lib/grants/ingestion/persistence/supabase";

function option(name: string) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((argument) => argument.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const runId = option("run-id");
  const requestedMode = option("mode");
  if (requestedMode && !["full_rebuild", "incremental"].includes(requestedMode)) {
    throw new Error("--mode must be full_rebuild or incremental.");
  }

  if (hasFlag("promote")) {
    if (!runId) throw new Error("--run-id is required for promotion.");
    console.info(JSON.stringify({ event: "grant_ingestion_promote", runId, result: await promoteIngestion(runId) }));
    return;
  }

  if (hasFlag("rollback")) {
    if (!runId) throw new Error("--run-id is required for rollback.");
    console.info(JSON.stringify({ event: "grant_ingestion_rollback", runId, result: await rollbackIngestion(runId) }));
    return;
  }

  const existingCatalog = await readExistingCatalogSnapshot();
  const limitValue = Number(option("limit"));
  const result = await runIngestion({
    existingCatalog,
    sourceName: option("source"),
    limit: Number.isFinite(limitValue) && limitValue > 0 ? limitValue : undefined,
  });
  const report = buildDryRunReport(result, existingCatalog);
  const reportPath = resolve(process.cwd(), "docs/grant-ingestion-dry-run-report.md");
  const auditPath = resolve(process.cwd(), "data/audits/grant-ingestion-dry-run.json");
  mkdirSync(resolve(process.cwd(), "docs"), { recursive: true });
  mkdirSync(resolve(process.cwd(), "data/audits"), { recursive: true });
  writeFileSync(reportPath, report);
  writeFileSync(auditPath, `${JSON.stringify({
    runId: result.runId,
    startedAt: result.startedAt,
    completedAt: result.completedAt,
    sourcesAttempted: result.sourcesAttempted,
    fetchedBySource: result.fetchedBySource,
    fetched: result.fetched,
    normalized: result.normalized,
    accepted: result.accepted.length,
    rejected: result.rejected,
    duplicateCandidates: result.duplicateCandidates,
    gates: result.gates,
    validationPassed: result.validationPassed,
  }, null, 2)}\n`);

  if (hasFlag("stage")) {
    await stageIngestion(
      result,
      existingCatalog,
      requestedMode === "incremental" ? "incremental" : "full_rebuild",
    );
  }

  console.info(JSON.stringify({
    event: "grant_ingestion_complete",
    mode: hasFlag("stage") ? "stage" : "dry_run",
    ingestionMode: requestedMode ?? (hasFlag("stage") ? "full_rebuild" : "dry_run"),
    runId: result.runId,
    fetched: result.fetched,
    accepted: result.accepted.length,
    rejected: result.rejected.length,
    validationPassed: result.validationPassed,
    reportPath,
    auditPath,
  }));

  if (!result.validationPassed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(JSON.stringify({
    event: "grant_ingestion_failed",
    message: error instanceof Error ? error.message : "Unknown error",
  }));
  process.exitCode = 1;
});
