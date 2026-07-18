import { z } from "zod";
import {
  ANNUAL_BUDGET_RANGES,
  MISSION_CATEGORIES,
  ORGANIZATION_AGE_RANGES,
  ORGANIZATION_TYPES,
  POPULATIONS_SERVED,
  PREFERRED_GRANT_AMOUNTS,
  PREFERRED_GRANT_TYPES,
  normalizeOrganizationType,
} from "@/types/organization";

const organizationTypeSchema = z.enum(ORGANIZATION_TYPES);
const DEFAULT_ORGANIZATION_TYPE = ORGANIZATION_TYPES[0];
const missionCategorySchema = z.enum(MISSION_CATEGORIES);
const populationSchema = z.enum(POPULATIONS_SERVED);
const annualBudgetSchema = z.enum(ANNUAL_BUDGET_RANGES);
const organizationAgeSchema = z.enum(ORGANIZATION_AGE_RANGES);
const preferredAmountSchema = z.enum(PREFERRED_GRANT_AMOUNTS);
const preferredTypeSchema = z.enum(PREFERRED_GRANT_TYPES);

function blankStringToUndefined(value: unknown) {
  return value === "" || value === null ? undefined : value;
}

export function normalizeOptionalWebsite(value: unknown): string {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

const optionalWebsiteSchema = z.preprocess(
  normalizeOptionalWebsite,
  z.union([z.literal(""), z.url().max(500)]),
);
const optionalAnnualBudgetSchema = z.preprocess(
  blankStringToUndefined,
  annualBudgetSchema.optional(),
);
const optionalPreferredAmountSchema = z.preprocess(
  blankStringToUndefined,
  preferredAmountSchema.optional(),
);

export const onboardingStep1Schema = z.object({
  organization_name: z.string().trim().min(1, "Organization name is required"),
  organization_type: organizationTypeSchema,
  has_501c3: z.boolean().default(false),
});

export const onboardingStep2Schema = z.object({
  mission: z.string().trim().min(20, "Tell us a little more about your mission").max(2000),
  programs: z.array(z.string().trim().min(1).max(500)).max(20).default([]),
  impact_goals: z.string().trim().max(3000).default(""),
  mission_categories: z
    .array(missionCategorySchema)
    .min(1, "Select at least one cause"),
});

export const onboardingStep3Schema = z.object({
  populations_served: z
    .array(populationSchema)
    .min(1, "Select at least one population"),
});

export const onboardingStep4Schema = z.object({
  state: z.string().trim().min(2, "State is required"),
  city: z.string().trim().optional().default(""),
});

export const onboardingStep5Schema = z.object({
  budget: z.number().int().min(0, "Annual budget cannot be negative").max(10_000_000_000),
  annual_budget_range: optionalAnnualBudgetSchema,
  organization_age_range: organizationAgeSchema,
  previous_grant_experience: z.string().trim().max(3000).default(""),
  website: optionalWebsiteSchema.default(""),
});

export const onboardingStep6Schema = z.object({
  preferred_grant_amount: optionalPreferredAmountSchema,
  requested_funding_min: z.number().int().min(0, "Minimum request cannot be negative"),
  requested_funding_max: z.number().int().min(1, "Maximum request is required"),
  preferred_grant_types: z
    .array(preferredTypeSchema)
    .min(1, "Select at least one grant type"),
  accept_government_grants: z.boolean().default(true),
}).refine((values) => values.requested_funding_max >= values.requested_funding_min, {
  message: "Maximum request must be at least the minimum request",
  path: ["requested_funding_max"],
});

export const onboardingCompleteSchema = onboardingStep1Schema
  .merge(onboardingStep2Schema)
  .merge(onboardingStep3Schema)
  .merge(onboardingStep4Schema)
  .merge(onboardingStep5Schema)
  .merge(onboardingStep6Schema);

export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>;
export type OnboardingStep4Input = z.infer<typeof onboardingStep4Schema>;
export type OnboardingStep5Input = z.infer<typeof onboardingStep5Schema>;
export type OnboardingStep6Input = z.infer<typeof onboardingStep6Schema>;
export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>;

export type OnboardingFormValues = Partial<OnboardingCompleteInput> & {
  onboarding_step?: number;
};

const stepSchemas = [
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  onboardingStep5Schema,
  onboardingStep6Schema,
] as const;

export function validateOnboardingStep(
  step: number,
  values: OnboardingFormValues,
): { success: true } | { success: false; fieldErrors: Record<string, string> } {
  const schema = stepSchemas[step - 1];
  if (!schema) {
    return { success: false, fieldErrors: { step: "Invalid step" } };
  }

  const parsed = schema.safeParse(values);
  if (parsed.success) {
    return { success: true };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }

  return { success: false, fieldErrors };
}

export function organizationToOnboardingValues(
  organization: {
    organization_name?: string;
    organization_type?: string;
    has_501c3?: boolean | null;
    is_501c3?: boolean | null;
    mission_categories?: string[] | null;
    mission?: string | null;
    programs?: string[] | null;
    impact_goals?: string | null;
    populations_served?: string[] | null;
    state?: string | null;
    city?: string | null;
    annual_budget_range?: string | null;
    budget?: number | null;
    previous_grant_experience?: string | null;
    website?: string | null;
    organization_age_range?: string | null;
    preferred_grant_amount?: string | null;
    requested_funding_min?: number | null;
    requested_funding_max?: number | null;
    preferred_grant_types?: string[] | null;
    accept_government_grants?: boolean | null;
    onboarding_step?: number | null;
  } | null,
): OnboardingFormValues {
  if (!organization) {
    return {
      organization_type: DEFAULT_ORGANIZATION_TYPE,
      has_501c3: false,
      accept_government_grants: true,
      mission_categories: [],
      mission: "",
      programs: [],
      impact_goals: "",
      previous_grant_experience: "",
      website: "",
      populations_served: [],
      preferred_grant_types: [],
      city: "",
    };
  }

  return {
    organization_name: organization.organization_name ?? "",
    organization_type: normalizeOrganizationType(
      organization.organization_type ?? DEFAULT_ORGANIZATION_TYPE,
    ),
    has_501c3: organization.has_501c3 ?? organization.is_501c3 ?? false,
    mission_categories: (organization.mission_categories ?? []) as OnboardingStep2Input["mission_categories"],
    mission: organization.mission ?? "",
    programs: organization.programs ?? [],
    impact_goals: organization.impact_goals ?? "",
    populations_served: (organization.populations_served ?? []) as OnboardingStep3Input["populations_served"],
    state: organization.state ?? "",
    city: organization.city ?? "",
    annual_budget_range: organization.annual_budget_range as OnboardingStep5Input["annual_budget_range"] | undefined,
    budget: organization.budget ?? undefined,
    previous_grant_experience: organization.previous_grant_experience ?? "",
    website: organization.website ?? "",
    organization_age_range: organization.organization_age_range as OnboardingStep5Input["organization_age_range"] | undefined,
    preferred_grant_amount: organization.preferred_grant_amount as OnboardingStep6Input["preferred_grant_amount"] | undefined,
    requested_funding_min: organization.requested_funding_min ?? undefined,
    requested_funding_max: organization.requested_funding_max ?? undefined,
    preferred_grant_types: (organization.preferred_grant_types ?? []) as OnboardingStep6Input["preferred_grant_types"],
    accept_government_grants: organization.accept_government_grants ?? true,
    onboarding_step: organization.onboarding_step ?? 1,
  };
}
