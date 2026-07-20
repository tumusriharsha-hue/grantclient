import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAllGrants } from "@/lib/grants/queries";
import { generateGrantMatches, selectGrantCandidates, toAiMatch } from "@/lib/ai/grant-matching";
import { controlledAiError } from "@/lib/ai/nvidia";
import { errorResponse, rateLimit, requestId, AI_MAX_BODY_BYTES } from "@/lib/ai/api-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const id = requestId();
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > AI_MAX_BODY_BYTES) return errorResponse(id, 413, "request_too_large", "Request is too large.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return errorResponse(id, 401, "unauthorized", "Sign in to match grants.");
  if (!rateLimit(`match:${user.id}`, 10)) return errorResponse(id, 429, "rate_limited", "Too many matching requests. Try again later.");
  try {
    const { data: organization } = await supabase.from("organizations").select("*").eq("user_id", user.id).maybeSingle();
    if (!organization) return errorResponse(id, 404, "not_found", "Organization profile not found.");
    const candidates = selectGrantCandidates(organization, await getAllGrants(), 12);
    if (candidates.length === 0) return Response.json({ matches: [], candidateCount: 0, requestId: id });
    const ai = await generateGrantMatches(organization, candidates);
    const byId = new Map(candidates.map((candidate) => [candidate.grant.id, candidate]));
    const matches = ai.matches.map((match) => toAiMatch(match, organization, byId.get(match.grantId)!)).sort((a, b) => b.finalScore - a.finalScore).slice(0, 5);
    return Response.json({ matches, candidateCount: candidates.length, requestId: id });
  } catch (error) {
    const safe = controlledAiError(error);
    console.error("AI grant matching request failed", { requestId: id, code: safe.code });
    return errorResponse(id, safe.code === "not_configured" ? 503 : 502, safe.code, safe.message);
  }
}
