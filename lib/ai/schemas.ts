import { z } from "zod";

export const candidateGrantSchema = z.object({
  grantId: z.string().min(1).max(200),
  title: z.string().min(1).max(300),
  funder: z.string().min(1).max(200),
  description: z.string().max(1200),
  category: z.string().max(100),
  locations: z.array(z.string().max(100)).max(30),
  eligibility: z.string().max(1000).nullable(),
  awardMin: z.number().nonnegative().nullable(),
  awardMax: z.number().nonnegative().nullable(),
  deadline: z.string().max(40).nullable(),
  rollingDeadline: z.boolean(),
  focusAreas: z.array(z.string().max(100)).max(30),
  populationsServed: z.array(z.string().max(100)).max(30),
  calculatedResults: z.object({
    populationFit: z.object({ status: z.string(), score: z.number(), explanation: z.string() }),
    fundingFit: z.object({ status: z.string(), score: z.number(), explanation: z.string() }),
  }).strict(),
}).strict();

export const organizationProfileSchema = z.object({
  name: z.string().min(1).max(300), mission: z.string().max(1500), programs: z.array(z.string().max(500)).max(30),
  focusAreas: z.array(z.string().max(100)).max(30), geography: z.array(z.string().max(100)).max(30),
  organizationType: z.string().max(100).nullable(), nonprofitStatus: z.string().max(100).nullable(),
  budget: z.number().nonnegative().nullable(), fundingNeed: z.string().max(500).nullable(), preferredGrantSize: z.string().max(200).nullable(),
  populationServed: z.array(z.string().max(100)).max(30), fundingMinimum: z.number().nonnegative().nullable(), fundingMaximum: z.number().nonnegative().nullable(),
}).strict();

export const matchScoreComponentsSchema = z.object({
  eligibility: z.number().int().min(0).max(100), missionAlignment: z.number().int().min(0).max(100), geographicFit: z.number().int().min(0).max(100),
  fundingFit: z.number().int().min(0).max(100), deadlineReadiness: z.number().int().min(0).max(100), capacityFit: z.number().int().min(0).max(100),
}).strict();

export const grantMatchSchema = z.object({
  grantId: z.string().min(1).max(200), scores: matchScoreComponentsSchema,
  explanation: z.string().min(1).max(600), concerns: z.array(z.string().min(1).max(300)).max(5), nextAction: z.string().min(1).max(300),
}).strict();

export const grantMatchingResponseSchema = z.object({ matches: z.array(grantMatchSchema).max(5) }).strict();
export type GrantMatchingResponse = z.infer<typeof grantMatchingResponseSchema>;

export const draftingRequestSchema = z.object({ section: z.object({ id: z.string().min(1).max(100), title: z.string().min(1).max(200), maxWords: z.number().int().positive().max(2000) }).strict(), sourceFields: z.record(z.string(), z.unknown()), userAnswers: z.record(z.string(), z.string().max(5000)).default({}), existingDraft: z.string().max(20000).default("") }).strict();

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
