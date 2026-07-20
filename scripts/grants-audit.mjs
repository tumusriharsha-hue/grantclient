import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildAudit, loadGrants, TODAY_ISO } from "./grants-audit-lib.mjs";

const audit = buildAudit(loadGrants());
const outputDir = join(process.cwd(), "data/audits");
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, `grants-audit-${TODAY_ISO}.json`);
writeFileSync(outputPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, total: audit.total, statusCounts: audit.statusCounts, requiringReview: audit.requiringReview, duplicateCandidates: audit.duplicateCandidates.length }, null, 2));
