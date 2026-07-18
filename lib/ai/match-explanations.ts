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

export async function generateMatchExplanations(): Promise<
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
          content: "You are an experienced nonprofit grant consultant. Return JSON only as {\"explanations\":[{\"grantId\":string,\"summary\":string,\"strengths\":string[],\"caution\":string|null}]}. Explain the supplied deterministic grant-fit scores for nonprofit organizations. Ground every explanation in the supplied mission, program, target-population, location, funding, and requirement facts. Never change scores, infer eligibility, recommend unrelated opportunities, or invent facts.",
        },
        { role: "user", content: JSON.stringify(request) },
      ],
    });
    const parsed = parseMatchExplanationResponse(
      completion.choices[0]?.message.content ?? null,
    );
    if (!parsed) throw new Error("invalid_response");
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
    const controlled = controlledAiError(error);
    return { success: false, code: controlled.code, error: controlled.message };
  }
}
