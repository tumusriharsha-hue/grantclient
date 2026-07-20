import { buildAudit, loadGrants } from "./grants-audit-lib.mjs";

const audit = buildAudit(loadGrants());
const next30 = new Date(Date.now() + 30 * 86400000);
const next60 = new Date(Date.now() + 60 * 86400000);
const next90 = new Date(Date.now() + 90 * 86400000);
const grants = loadGrants();
const inWindow = (limit) => grants.filter((grant) => grant.deadline && new Date(`${grant.deadline}T23:59:59.999Z`) >= new Date() && new Date(`${grant.deadline}T23:59:59.999Z`) <= limit).length;
console.log(JSON.stringify({ ...audit.statusCounts, total: audit.total, deadlinesNext30Days: inWindow(next30), deadlinesNext60Days: inWindow(next60), deadlinesNext90Days: inWindow(next90), requiringReview: audit.requiringReview, duplicateCandidates: audit.duplicateCandidates.length }, null, 2));
