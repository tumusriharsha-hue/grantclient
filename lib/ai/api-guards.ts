import { randomUUID } from "node:crypto";

const buckets = new Map<string, { started: number; count: number }>();
export const AI_MAX_BODY_BYTES = 20_000;

export function requestId() { return randomUUID(); }

export function rateLimit(key: string, max: number, windowMs = 60 * 60 * 1000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || now - current.started >= windowMs) { buckets.set(key, { started: now, count: 1 }); return true; }
  current.count += 1;
  return current.count <= max;
}

export function errorResponse(requestIdValue: string, status: number, code: string, message: string) {
  return Response.json({ error: { code, message }, requestId: requestIdValue }, { status });
}
