/**
 * Check grant program/application URLs without changing grant data.
 *
 * Usage:
 *   node scripts/grants-link-audit.mjs
 *   node scripts/grants-link-audit.mjs --write
 *
 * This only checks reachability and redirects. It does not treat a 200
 * response as proof that a grant is current or that its contents are correct;
 * those facts still require a reviewer to record an official source.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TODAY = new Date().toISOString().slice(0, 10);
const grants = JSON.parse(readFileSync(join(process.cwd(), "data/grants.json"), "utf8"));
const timeoutMs = 5_000;
const concurrency = 12;

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return null;
    return url.href;
  } catch {
    return null;
  }
}

async function checkUrl(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return { url, ok: false, status: null, finalUrl: null, error: "invalid_url" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response = await fetch(normalized, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "Grantclient-verification-audit/1.0" },
    });

    if ([403, 405, 429].includes(response.status)) {
      response = await fetch(normalized, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": "Grantclient-verification-audit/1.0" },
      });
    }

    const finalUrl = response.url || normalized;
    const redirectedToDifferentHost = new URL(finalUrl).host !== new URL(normalized).host;
    return {
      url: normalized,
      ok: response.ok,
      status: response.status,
      finalUrl,
      redirectedToDifferentHost,
      error: response.ok ? null : `http_${response.status}`,
    };
  } catch (error) {
    return {
      url: normalized,
      ok: false,
      status: null,
      finalUrl: null,
      error: error?.name === "AbortError" ? "timeout" : "network_error",
    };
  } finally {
    clearTimeout(timer);
  }
}

const linksByKey = new Map();
for (const grant of grants) {
  for (const [field, url] of [
    ["officialProgramUrl", grant.officialUrl ?? grant.sourceUrl],
    ["applicationUrl", grant.applicationUrl],
  ]) {
    if (url) linksByKey.set(`${grant.id}|${field}`, { grantId: grant.id, field, url });
  }
}
const links = [...linksByKey.values()];

const results = [];
for (let index = 0; index < links.length; index += concurrency) {
  const batch = links.slice(index, index + concurrency);
  results.push(...await Promise.all(batch.map(async (link) => ({ ...link, ...(await checkUrl(link.url)) }))));
}

const report = {
  generatedAt: new Date().toISOString(),
  totalGrants: grants.length,
  totalLinks: results.length,
  healthyLinks: results.filter((result) => result.ok).length,
  failedLinks: results.filter((result) => !result.ok).length,
  results,
};

console.log(JSON.stringify({
  generatedAt: report.generatedAt,
  totalGrants: report.totalGrants,
  totalLinks: report.totalLinks,
  healthyLinks: report.healthyLinks,
  failedLinks: report.failedLinks,
}, null, 2));

if (process.argv.includes("--write")) {
  const outputPath = join(process.cwd(), "data/audits", `grants-link-audit-${TODAY}.json`);
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ outputPath }, null, 2));
}

if (report.failedLinks > 0) process.exitCode = 2;
