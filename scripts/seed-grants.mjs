/**
 * Seed grants from data/grants.json into Supabase.
 * Replaces the catalog: stale grants are deleted, then current grants are upserted.
 *
 * Workflow:
 *   node scripts/import-verified-grants.mjs
 *   node scripts/seed-grants.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GRANTS_PATH = join(__dirname, "../data/grants.json");
const BATCH_SIZE = 50;

function loadEnvLocal() {
  try {
    const envPath = join(__dirname, "../.env.local");
    const contents = readFileSync(envPath, "utf8");

    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // .env.local is optional when env vars are already set
  }
}

function mapGrantToRow(grant) {
  return {
    id: grant.id,
    title: grant.title,
    description: grant.description,
    funder: grant.funder,
    category: grant.category,
    region: grant.region,
    status: grant.status,
    amount: grant.amount ?? null,
    application_open_date: grant.applicationOpenDate ?? null,
    deadline: grant.deadline ?? null,
    deadline_type: grant.deadlineType ?? "unknown",
    deadline_timezone: grant.deadlineTimezone ?? null,
    application_url: grant.applicationUrl,
    official_url: grant.officialUrl ?? null,
    source_url: grant.sourceUrl ?? null,
    verified_at: grant.verifiedAt ?? null,
    next_review_at: grant.nextReviewAt ?? null,
    confidence_level: grant.confidenceLevel ?? "low",
    invitation_only: grant.invitationOnly ?? false,
    unsolicited_applications_accepted: grant.unsolicitedApplicationsAccepted ?? null,
    restrictions: grant.restrictions ?? null,
    typical_award: grant.typicalAward ?? null,
    verification_notes: grant.verificationNotes ?? null,
    created_at: grant.createdAt,
    updated_at: grant.updatedAt,
  };
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local.",
  );
  process.exit(1);
}

const grants = JSON.parse(readFileSync(GRANTS_PATH, "utf8"));
const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const newIds = grants.map((grant) => grant.id);
const { data: existingRows, error: existingError } = await supabase.from("grants").select("id");

if (existingError) {
  console.error("Failed to read existing grants:", existingError.message);
  process.exit(1);
}

const staleIds = (existingRows ?? [])
  .map((row) => row.id)
  .filter((id) => !newIds.includes(id));

if (staleIds.length > 0) {
  for (let index = 0; index < staleIds.length; index += BATCH_SIZE) {
    const batch = staleIds.slice(index, index + BATCH_SIZE);
    const { error } = await supabase.from("grants").delete().in("id", batch);

    if (error) {
      console.error(`Failed deleting stale grants at index ${index}:`, error.message);
      process.exit(1);
    }
  }

  console.log(`Removed ${staleIds.length} stale grants`);
}

let upserted = 0;

for (let index = 0; index < grants.length; index += BATCH_SIZE) {
  const batch = grants.slice(index, index + BATCH_SIZE).map(mapGrantToRow);
  const { error } = await supabase.from("grants").upsert(batch, { onConflict: "id" });

  if (error) {
    console.error(`Failed at batch starting at index ${index}:`, error.message);
    process.exit(1);
  }

  upserted += batch.length;
  console.log(`Upserted ${upserted}/${grants.length} grants`);
}

const { count, error: countError } = await supabase
  .from("grants")
  .select("*", { count: "exact", head: true });

if (countError) {
  console.error("Failed to verify grant count:", countError.message);
  process.exit(1);
}

console.log(`Done. ${count} grants in Supabase.`);
