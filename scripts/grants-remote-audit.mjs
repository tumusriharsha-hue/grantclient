/** Read-only Supabase catalog inventory. Never updates or deletes grant rows. */
import { readFileSync } from "node:fs";

function loadEnv() {
  const values = {};
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return values;
}

const env = loadEnv();
const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const apiKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!baseUrl || !apiKey) throw new Error("Missing Supabase environment configuration.");

const response = await fetch(`${baseUrl}/rest/v1/grants?select=id,status,deadline,application_url,official_url,source_url,verified_at,confidence_level&limit=1000`, {
  headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
});
if (!response.ok) throw new Error(`Supabase returned HTTP ${response.status}.`);

const grants = await response.json();
const statusCounts = grants.reduce((counts, grant) => {
  counts[grant.status] = (counts[grant.status] ?? 0) + 1;
  return counts;
}, {});
const missingOfficialSource = grants.filter((grant) => !grant.official_url && !grant.source_url).length;
const missingVerification = grants.filter((grant) => !grant.verified_at).length;
const pastDeadlines = grants.filter((grant) => grant.deadline && new Date(`${grant.deadline}T23:59:59.999Z`) < new Date()).length;

console.log(JSON.stringify({
  total: grants.length,
  statusCounts,
  missingOfficialSource,
  missingVerification,
  pastDeadlines,
}, null, 2));
