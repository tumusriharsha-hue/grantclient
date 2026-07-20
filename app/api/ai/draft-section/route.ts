import "server-only";

import { generateProposalSection } from "@/lib/ai/generate-section";
import { errorResponse, rateLimit, requestId, AI_MAX_BODY_BYTES } from "@/lib/ai/api-guards";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
const schema = z.object({ applicationId: z.uuid(), sectionKey: z.string().min(1).max(100) }).strict();

export async function POST(request: Request) {
  const id = requestId();
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > AI_MAX_BODY_BYTES) return errorResponse(id, 413, "request_too_large", "Request is too large.");
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > AI_MAX_BODY_BYTES) return errorResponse(id, 413, "request_too_large", "Request is too large.");
  let body: unknown = null;
  try { body = JSON.parse(rawBody || "null"); } catch { return errorResponse(id, 400, "invalid_request", "Invalid JSON request."); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return errorResponse(id, 400, "invalid_request", "Invalid section request.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return errorResponse(id, 401, "unauthorized", "Sign in to draft a section.");
  if (!rateLimit(`draft:${user.id}`, 20)) return errorResponse(id, 429, "rate_limited", "Too many drafting requests. Try again later.");
  const result = await generateProposalSection(parsed.data.applicationId, parsed.data.sectionKey);
  return Response.json({ ...result, requestId: id }, { status: result.success ? 200 : result.code === "unauthorized" ? 401 : 400 });
}
