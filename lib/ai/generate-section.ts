import "server-only";

import { createHash } from "node:crypto";
import { AI_LIMITS } from "@/lib/ai/limits";
import { controlledAiError, getNvidiaClient } from "@/lib/ai/nvidia";
import { draftSectionOutputSchema, type DraftSectionOutput } from "@/lib/ai/schemas";
import {
  buildSectionGenerationContext,
  ensureNeedsInputMarkers,
} from "@/lib/ai/section-context";
import { proposalTemplate } from "@/lib/applications/proposal-template";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export const SECTION_PROMPT_VERSION = "proposal-section-v2";

function parseJson(content: string | null) {
  if (!content) throw new Error("empty_response");
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return JSON.parse(fenced?.[1] ?? content) as unknown;
}

export async function generateProposalSection(applicationId: string, sectionKey: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) {
    return { success: false as const, code: "unauthorized", error: "Sign in to generate a section." };
  }

  const template = proposalTemplate.find((item) => item.id === sectionKey);
  if (!template || !template.aiEnabled) {
    return { success: false as const, code: "not_allowed", error: "This section is populated from saved facts." };
  }

  const [{ data: application }, { data: section }] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("application_sections")
      .select("*")
      .eq("application_id", applicationId)
      .eq("section_key", sectionKey)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (!application || !section || !application.organization_id) {
    return { success: false as const, code: "not_found", error: "Application section not found." };
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", application.organization_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!organization) {
    return { success: false as const, code: "not_found", error: "Organization profile not found." };
  }

  const setup =
    application.setup_data && typeof application.setup_data === "object" && !Array.isArray(application.setup_data)
      ? application.setup_data
      : {};
  const grant =
    application.grant_snapshot && typeof application.grant_snapshot === "object" && !Array.isArray(application.grant_snapshot)
      ? application.grant_snapshot
      : {};
  const context = buildSectionGenerationContext(template, {
    organization: organization as unknown as Record<string, unknown>,
    application: setup as Record<string, unknown>,
    grant: grant as Record<string, unknown>,
  });
  const request = {
    section: { id: template.id, title: template.title, maxWords: template.maxWords },
    sourceFields: context.fields,
    missingRequiredFields: context.missingRequired,
  };
  if (JSON.stringify(request).length > AI_LIMITS.applicationContextCharacters) {
    return {
      success: false as const,
      code: "context_too_long",
      error: "This section has too much source text. Shorten the relevant application answers and try again.",
    };
  }
  const requestHash = createHash("sha256").update(JSON.stringify(request)).digest("hex");
  let generationCacheKey: string | null = null;

  try {
    const { client, model } = getNvidiaClient();
    const key = createHash("sha256")
      .update([user.id, applicationId, sectionKey, requestHash, SECTION_PROMPT_VERSION, model].join("|"))
      .digest("hex");
    generationCacheKey = key;
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase
      .from("ai_generation_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneMinuteAgo);
    if ((count ?? 0) >= 10) {
      return { success: false as const, code: "rate_limited", error: "Too many generation requests. Try again shortly." };
    }

    const { data: cached } = await supabase
      .from("ai_generation_records")
      .select("response, status")
      .eq("cache_key", key)
      .maybeSingle();
    if (cached?.status === "pending") {
      return { success: false as const, code: "in_progress", error: "This section is already being generated." };
    }

    const cachedOutput = cached?.status === "completed"
      ? draftSectionOutputSchema.safeParse(cached.response)
      : null;
    let outputData: DraftSectionOutput | null = cachedOutput?.success
      ? cachedOutput.data
      : null;
    if (!outputData) {
      const { error: reservationError } = await supabase
        .from("ai_generation_records")
        .upsert({
          user_id: user.id,
          organization_id: organization.id,
          application_id: applicationId,
          grant_id: application.grant_id,
          generation_kind: "proposal_section",
          cache_key: key,
          request_hash: requestHash,
          status: "pending",
          prompt_version: SECTION_PROMPT_VERSION,
          model,
        }, { onConflict: "cache_key" });
      if (reservationError) throw new Error("reservation_failed");

      const completion = await client.chat.completions.create({
        model,
        temperature: 0.1,
        max_tokens: Math.min(AI_LIMITS.sectionOutputTokens, template.maxWords * 3),
        response_format: { type: "json_object" },
        messages: [
          {
          role: "system",
            content: "You are an experienced nonprofit grant consultant writing a funding application. Return JSON only as {\"content\":string,\"missingInformation\":string[],\"usedSourceFields\":string[]}. Write only the requested proposal section using supplied nonprofit and grant facts. Make the narrative specific to the organization's mission, programs, community served, funding need, and the funder's priorities when supplied. Never invent figures, dates, history, credentials, partnerships, outcomes, legal status, or grant requirements. Insert [NEEDS INPUT: description] for missing facts.",
          },
          { role: "user", content: JSON.stringify(request) },
        ],
      });
      const output = draftSectionOutputSchema.safeParse(
        parseJson(completion.choices[0]?.message.content ?? null),
      );
      if (!output.success) throw new Error("invalid_response");
      const wordCount = output.data.content.trim().split(/\s+/).length;
      if (wordCount > Math.min(template.maxWords, AI_LIMITS.sectionMaximumWords)) {
        throw new Error("word_limit_exceeded");
      }
      const used = output.data.usedSourceFields.filter((field) => context.allowedFields.includes(field));
      outputData = { ...output.data, usedSourceFields: used };
      await supabase
        .from("ai_generation_records")
        .update({
          response: outputData as unknown as Json,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("cache_key", key)
        .eq("user_id", user.id);
    }

    const content = ensureNeedsInputMarkers(outputData.content, context.missingRequired);
    const { error: saveError } = await supabase
      .from("application_sections")
      .update({
        previous_content: section.content || null,
        content,
        missing_information: outputData.missingInformation as unknown as Json,
        used_source_fields: outputData.usedSourceFields as unknown as Json,
        status: "draft",
        prompt_version: SECTION_PROMPT_VERSION,
        model,
        generated_at: new Date().toISOString(),
      })
      .eq("id", section.id)
      .eq("user_id", user.id);
    if (saveError) throw new Error("save_failed");
    return {
      success: true as const,
      section: {
        content,
        previousContent: section.content || null,
        missingInformation: outputData.missingInformation,
        usedSourceFields: outputData.usedSourceFields,
      },
    };
  } catch (error) {
    if (generationCacheKey) {
      await supabase
        .from("ai_generation_records")
        .update({ status: "failed", error_code: "generation_failed", completed_at: new Date().toISOString() })
        .eq("cache_key", generationCacheKey)
        .eq("user_id", user.id);
    }
    const controlled = controlledAiError(error);
    return { success: false as const, code: controlled.code, error: controlled.message };
  }
}
