import "server-only";

import { createHash } from "node:crypto";
import { AI_LIMITS, truncateForModel } from "@/lib/ai/limits";
import { controlledAiError, getNvidiaClient } from "@/lib/ai/nvidia";
import {
  matchExplanationSchema,
  parseMatchExplanationResponse,
  type MatchExplanation,
} from "@/lib/ai/schemas";
import { getRecommendedGrants } from "@/lib/grants/get-recommended-grants";
import type { RecommendedGrant } from "@/lib/grants/matching-types";
import { createClient } from "@/lib/supabase/server";
import type { Json, Organization } from "@/types/database";

export const MATCH_EXPLANATION_PROMPT_VERSION = "match-explanation-v2";

function cacheKey(organization: Organization, grant: RecommendedGrant, model: string) {
  return createHash("sha256")
    .update([
      organization.updated_at,
      grant.updatedAt,
      grant.scoreVersion,
      MATCH_EXPLANATION_PROMPT_VERSION,
      model,
      grant.id,
    ].join("|"))
    .digest("hex");
}

function compactGrant(grant: RecommendedGrant) {
  return {
    grantId: grant.id,
    grantName: grant.title,
    funderName: grant.funder,
    description: truncateForModel(grant.description, AI_LIMITS.grantDescriptionCharacters),
    scoreBreakdown: grant.components,
    verificationWarnings: grant.verificationItems,
  };
}

export async function loadCachedMatchExplanations(
  organization: Organization,
  grants: RecommendedGrant[],
): Promise<RecommendedGrant[]> {
  const model = process.env.NVIDIA_NIM_MODEL?.trim();
  if (!model || grants.length === 0) return grants;
  const supabase = await createClient();
  const keys = grants.map((grant) => cacheKey(organization, grant, model));
  const { data } = await supabase
    .from("grant_match_snapshots")
    .select("cache_key, explanation")
    .in("cache_key", keys);
  const byKey = new Map((data ?? []).map((row) => [row.cache_key, row.explanation]));
  return grants.map((grant) => {
    const parsed = matchExplanationSchema.safeParse(
      byKey.get(cacheKey(organization, grant, model)),
    );
    return parsed.success
      ? {
          ...grant,
          explanation: {
            summary: parsed.data.summary,
            strengths: parsed.data.strengths,
            caution: parsed.data.caution,
          },
        }
      : grant;
  });
}

export async function generateMatchExplanations(
  options: { force?: boolean } = {},
): Promise<
  | { success: true }
  | { success: false; error: string; code: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) {
    return { success: false, code: "unauthorized", error: "Sign in to generate explanations." };
  }

  const { organization, grants } = await getRecommendedGrants(5);
  if (!organization || grants.length === 0) return { success: true };

  try {
    const { client, model } = getNvidiaClient();
    const missing = [] as RecommendedGrant[];
    for (const grant of grants) {
      if (options.force) {
        missing.push(grant);
        continue;
      }
      const key = cacheKey(organization, grant, model);
      const { data } = await supabase
        .from("grant_match_snapshots")
        .select("explanation")
        .eq("cache_key", key)
        .maybeSingle();
      if (!matchExplanationSchema.safeParse(data?.explanation).success) missing.push(grant);
    }
    if (missing.length === 0) return { success: true };

    const request = {
      organization: {
        name: organization.organization_name,
        mission: truncateForModel(organization.mission, AI_LIMITS.organizationMissionCharacters),
        tags: organization.mission_categories ?? [],
      },
      grants: missing.map(compactGrant),
    };
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.1,
      max_tokens: AI_LIMITS.matchExplanationOutputTokens,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an experienced nonprofit grant consultant. Return one valid JSON object only, with exactly this shape and no extra keys: {\"explanations\":[{\"grantId\":string,\"summary\":string,\"strengths\":string[],\"caution\":string|null}]}. Include exactly one explanation for every supplied grant and copy each grantId exactly. Keep each summary to at most 2 short sentences, include 1 to 3 concise strengths, and use null when there is no factual caution. Explain the supplied deterministic grant-fit scores for nonprofit organizations. Ground every explanation in the supplied mission, program, target-population, location, funding, and requirement facts. Never change scores, infer eligibility, recommend unrelated opportunities, or invent facts.",
        },
        { role: "user", content: JSON.stringify(request) },
      ],
    });
    const parsed = parseMatchExplanationResponse(
      completion.choices[0]?.message.content ?? null,
    );
    if (!parsed) {
      console.error("[AI match explanations] Invalid model response", {
        finishReason: completion.choices[0]?.finish_reason,
        contentLength: completion.choices[0]?.message.content?.length ?? 0,
      });
      throw new Error("invalid_response");
    }
    const allowedIds = new Set(missing.map((grant) => grant.id));
    const explanations = parsed.explanations.filter((item) => allowedIds.has(item.grantId));
    const explanationById = new Map<string, MatchExplanation>(
      explanations.map((item) => [item.grantId, item]),
    );

    const rows = missing.flatMap((grant) => {
      const explanation = explanationById.get(grant.id);
      if (!explanation) return [];
      return [{
      user_id: user.id,
      organization_id: organization.id,
      grant_id: grant.id,
      score: grant.totalScore,
      score_breakdown: grant.components as unknown as Json,
      score_version: grant.scoreVersion,
      eligibility_status: grant.eligibilityStatus,
      verification_items: grant.verificationItems,
      explanation: explanation as unknown as Json,
      prompt_version: MATCH_EXPLANATION_PROMPT_VERSION,
      model,
      cache_key: cacheKey(organization, grant, model),
      organization_updated_at: organization.updated_at,
      grant_updated_at: grant.updatedAt,
      generated_at: new Date().toISOString(),
      }];
    });
    if (rows.length === 0) throw new Error("invalid_response");
    const { error } = await supabase
      .from("grant_match_snapshots")
      .upsert(rows, { onConflict: "cache_key" });
    if (error) throw new Error("cache_write_failed");
    return { success: true };
  } catch (error) {
    console.error("[AI match explanations]", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      status:
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : undefined,
      code:
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof error.code === "string"
          ? error.code
          : undefined,
    });
    const controlled = controlledAiError(error);
    return { success: false, code: controlled.code, error: controlled.message };
  }
}
