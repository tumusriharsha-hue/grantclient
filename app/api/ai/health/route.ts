import "server-only";

import { healthCheck } from "@/lib/ai/nvidia";
import { errorResponse, rateLimit, requestId } from "@/lib/ai/api-guards";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const id = requestId();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) {
    return errorResponse(id, 401, "unauthorized", "Sign in to check AI availability.");
  }
  if (!rateLimit(`health:${user.id}`, 3, 5 * 60 * 1000)) {
    return errorResponse(id, 429, "rate_limited", "Too many health checks. Try again later.");
  }
  const result = await healthCheck();
  return Response.json(
    { ...result, requestId: id },
    { status: result.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
