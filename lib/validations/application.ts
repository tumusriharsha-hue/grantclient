import { z } from "zod";

const shortText = z.string().trim().min(1).max(500);
const narrative = z.string().trim().min(1).max(5000);
const optionalNarrative = z.string().trim().max(5000).default("");

export const applicationSetupSchema = z
  .object({
    grantId: z.string().trim().max(200).default(""),
    projectName: shortText,
    amountRequested: z.coerce.number().int().positive().max(1_000_000_000),
    projectStartDate: z.iso.date(),
    projectEndDate: z.iso.date(),
    projectSummary: narrative,
    problemStatement: narrative,
    targetBeneficiaries: shortText,
    peopleServed: z.union([z.literal(""), z.coerce.number().int().positive().max(1_000_000)]),
    plannedActivities: narrative,
    measurableOutcomes: narrative,
    evaluationApproach: narrative,
    projectBudgetSummary: narrative,
    sustainabilityPlan: optionalNarrative,
    partnerships: optionalNarrative,
    staffResponsible: optionalNarrative,
    organizationNotes: optionalNarrative,
    selectedDocumentIds: z.array(z.uuid()).max(50).default([]),
    grantQuestionResponses: z.record(z.string().max(200), z.string().trim().max(5000)).default({}),
  })
  .refine((value) => value.projectEndDate >= value.projectStartDate, {
    message: "Project end date must be on or after the start date",
    path: ["projectEndDate"],
  });

export const draftSectionInputSchema = z.object({
  id: z.string().max(100).optional(),
  sectionKey: z.string().trim().max(100).optional(),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(20_000),
  status: z.enum(["not_started", "draft", "complete", "stale"]).optional(),
  previousBody: z.string().max(20_000).nullable().optional(),
}).strict();

export const saveApplicationDraftSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().max(200),
  sections: z.array(draftSectionInputSchema).max(30),
}).strict();

export const applicationStatusUpdateSchema = z.object({
  applicationId: z.uuid(),
  title: z.string().trim().min(1).max(200),
  status: z.enum(["drafting", "submitted", "approved", "rejected"]),
  statusDate: z.preprocess((value) => value === "" ? null : value, z.iso.date().nullable()),
  nextDate: z.preprocess((value) => value === "" ? null : value, z.iso.date().nullable()),
  amount: z.string().trim().max(100).nullable(),
  statusNote: z.string().trim().max(5_000).nullable(),
}).strict();

export type ApplicationSetupInput = z.infer<typeof applicationSetupSchema>;

export function parseApplicationSetup(formData: FormData) {
  const grantQuestionResponses = Object.fromEntries(
    [...formData.entries()]
      .filter(([key, value]) => key.startsWith("grantQuestion:") && typeof value === "string")
      .map(([key, value]) => [key.slice("grantQuestion:".length), value]),
  );
  return applicationSetupSchema.safeParse({
    ...Object.fromEntries(formData.entries()),
    selectedDocumentIds: formData
      .getAll("selectedDocumentIds")
      .filter((value): value is string => typeof value === "string"),
    grantQuestionResponses,
  });
}
