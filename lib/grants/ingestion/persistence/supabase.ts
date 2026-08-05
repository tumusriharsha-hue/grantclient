import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ExistingCatalogSnapshot, IngestionResult, NormalizedGrantRecord } from "../types";

function loadLocalEnvironment() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

function credentials() {
  loadLocalEnvironment();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!baseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }
  return { baseUrl, serviceRoleKey };
}

async function request(path: string, init: RequestInit = {}) {
  const { baseUrl, serviceRoleKey } = credentials();
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${detail.slice(0, 500)}`);
  }
  return response;
}

async function countTable(table: string): Promise<number> {
  const response = await request(`${table}?select=id&limit=1`, {
    method: "GET",
    headers: { Prefer: "count=exact" },
  });
  const range = response.headers.get("content-range");
  return Number(range?.split("/")[1] ?? 0);
}

export async function readExistingCatalogSnapshot(): Promise<ExistingCatalogSnapshot> {
  const grantsResponse = await request("grants?select=id,is_active,verified_at&order=id.asc&limit=5000");
  const grants = (await grantsResponse.json()) as Array<{
    id: string;
    is_active: boolean;
    verified_at: string | null;
  }>;
  const [savedGrants, applications, generatedProposals, grantMatchSnapshots, applicationSections, aiGenerationRecords] =
    await Promise.all([
      countTable("saved_grants"),
      countTable("applications"),
      countTable("generated_proposals"),
      countTable("grant_match_snapshots"),
      countTable("application_sections"),
      countTable("ai_generation_records"),
    ]);
  return {
    grants: grants.length,
    activeGrants: grants.filter((grant) => grant.is_active).length,
    verifiedGrants: grants.filter((grant) => Boolean(grant.verified_at)).length,
    savedGrants,
    applications,
    generatedProposals,
    grantMatchSnapshots,
    applicationSections,
    aiGenerationRecords,
    checksum: createHash("sha256").update(grants.map((grant) => grant.id).join("\n")).digest("hex"),
  };
}

function toStagingRow(runId: string, record: NormalizedGrantRecord) {
  return {
    run_id: runId,
    id: record.id,
    source: record.source,
    source_record_id: record.sourceRecordId,
    source_url: record.sourceUrl,
    source_application_url: record.sourceApplicationUrl,
    grant_name: record.grantName,
    funder_name: record.funderName,
    funder_type: record.funderType,
    description: record.description,
    summary: record.summary,
    eligibility_summary: record.eligibilitySummary,
    eligible_organization_types: record.eligibleOrganizationTypes,
    nonprofit_eligible: record.nonprofitEligible,
    requires_501c3: record.requires501c3,
    fiscal_sponsor_allowed: record.fiscalSponsorAllowed,
    eligible_states: record.eligibleStates,
    eligible_counties: record.eligibleCounties,
    eligible_countries: record.eligibleCountries,
    geographic_scope: record.geographicScope,
    focus_areas: record.focusAreas,
    target_populations: record.targetPopulations,
    program_types: record.programTypes,
    minimum_award: record.minimumAward,
    maximum_award: record.maximumAward,
    estimated_award: record.estimatedAward,
    total_funding_available: record.totalFundingAvailable,
    currency: record.currency,
    deadline: record.deadline,
    deadline_type: record.deadlineType,
    opens_at: record.opensAt,
    letter_of_intent_deadline: record.letterOfIntentDeadline,
    rolling: record.rolling,
    recurring: record.recurring,
    frequency: record.frequency,
    matching_funds_required: record.matchingFundsRequired,
    application_requirements: record.applicationRequirements,
    required_documents: record.requiredDocuments,
    contact_name: record.contactName,
    contact_email: record.contactEmail,
    contact_phone: record.contactPhone,
    status: record.status,
    verification_status: record.verificationStatus,
    verification_method: record.verificationMethod,
    verified_at: record.verifiedAt,
    last_checked_at: record.lastCheckedAt,
    first_seen_at: record.firstSeenAt,
    published_at: record.publishedAt,
    content_hash: record.contentHash,
    raw_source_data: record.rawSourceData,
    category: record.category,
    region: record.region,
  };
}

async function insertBatches(table: string, rows: Record<string, unknown>[], batchSize = 200) {
  for (let index = 0; index < rows.length; index += batchSize) {
    await request(table, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(rows.slice(index, index + batchSize)),
    });
  }
}

export async function stageIngestion(
  result: IngestionResult,
  existingCatalog: ExistingCatalogSnapshot,
  mode: "full_rebuild" | "incremental" = "full_rebuild",
) {
  if (!result.validationPassed) throw new Error("Validation gates failed; staging is blocked.");
  await request("grant_ingestion_runs", {
    method: "POST",
    body: JSON.stringify({
      id: result.runId,
      mode,
      status: "staging",
      started_at: result.startedAt,
      completed_at: result.completedAt,
      sources_attempted: result.sourcesAttempted,
      records_fetched: result.fetched,
      records_normalized: result.normalized,
      records_accepted: result.accepted.length,
      records_rejected: result.rejected.length,
      records_deduplicated: result.deduplicated,
      validation_failures: result.gates.filter((gate) => !gate.passed),
      validation_passed: result.validationPassed,
      before_counts: existingCatalog,
      source_counts: result.fetchedBySource,
    }),
  });
  await insertBatches("grants_ingestion_staging", result.accepted.map((record) => toStagingRow(result.runId, record)));
  await insertBatches(
    "grant_ingestion_rejections",
    result.rejected.map((rejected) => ({
      run_id: result.runId,
      source: rejected.source,
      source_record_id: rejected.sourceRecordId,
      source_url: rejected.sourceUrl,
      grant_name: rejected.grantName,
      funder_name: rejected.funderName,
      reason_code: rejected.reason,
      reason_detail: rejected.detail,
      recommended_action: rejected.recommendedAction,
      raw_source_data: rejected.rawSourceData,
    })),
  );
  await request(`grant_ingestion_runs?id=eq.${result.runId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "staged" }),
  });
}

export async function promoteIngestion(runId: string) {
  const response = await request("rpc/promote_grant_ingestion", {
    method: "POST",
    body: JSON.stringify({ target_run_id: runId }),
  });
  return response.json();
}

export async function rollbackIngestion(runId: string) {
  const response = await request("rpc/rollback_grant_ingestion", {
    method: "POST",
    body: JSON.stringify({ target_run_id: runId }),
  });
  return response.json();
}
