import "server-only";

import { healthCheck } from "@/lib/ai/nvidia";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await healthCheck();
  return Response.json(result, { status: result.ok ? 200 : 503 });
}
