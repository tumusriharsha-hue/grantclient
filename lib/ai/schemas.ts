import { z } from "zod";

export const matchExplanationSchema = z.object({
  grantId: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  strengths: z.array(z.string().min(1).max(240)).min(1).max(3),
  caution: z.string().min(1).max(300).nullable(),
}).strict();

export const matchExplanationBatchSchema = z.object({
  explanations: z.array(matchExplanationSchema).max(5),
}).strict();

export type MatchExplanation = z.infer<typeof matchExplanationSchema>;
export type MatchExplanationBatch = z.infer<typeof matchExplanationBatchSchema>;

export function parseMatchExplanationResponse(
  content: string | null,
): MatchExplanationBatch | null {
  if (!content) return null;
  try {
    const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const json = JSON.parse(fenced?.[1] ?? content) as unknown;
    const parsed = matchExplanationBatchSchema.safeParse(json);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const draftSectionOutputSchema = z.object({
  content: z.string().min(1).max(20_000),
  missingInformation: z.array(z.string().min(1).max(300)).max(20),
  usedSourceFields: z.array(z.string().min(1).max(200)).max(30),
}).strict();

export type DraftSectionOutput = z.infer<typeof draftSectionOutputSchema>;
