import { z } from "zod";
import {
  ANNUAL_BUDGET_RANGES,
  MISSION_CATEGORIES,
  ORGANIZATION_AGE_RANGES,
  ORGANIZATION_TYPES,
  POPULATIONS_SERVED,
  PREFERRED_GRANT_AMOUNTS,
  PREFERRED_GRANT_TYPES,
} from "@/types/organization";

const organizationTypeSchema = z.enum(ORGANIZATION_TYPES);
const missionCategorySchema = z.enum(MISSION_CATEGORIES);
const populationSchema = z.enum(POPULATIONS_SERVED);
const annualBudgetSchema = z.enum(ANNUAL_BUDGET_RANGES);
const organizationAgeSchema = z.enum(ORGANIZATION_AGE_RANGES);
const preferredAmountSchema = z.enum(PREFERRED_GRANT_AMOUNTS);
const preferredTypeSchema = z.enum(PREFERRED_GRANT_TYPES);

export const onboardingStep1Schema = z.object({
  organization_name: z.string().trim().min(1, "Organization name is required"),
  organization_type: organizationTypeSchema,
  has_501c3: z.boolean().default(false),
});

export const onboardingStep2Schema = z.object({
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
  annual_budget_range: annualBudgetSchema,
  organization_age_range: organizationAgeSchema,
});

export const onboardingStep6Schema = z.object({
  preferred_grant_amount: preferredAmountSchema,
  preferred_grant_types: z
    .array(preferredTypeSchema)
    .min(1, "Select at least one grant type"),
  accept_government_grants: z.boolean().default(true),
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
    populations_served?: string[] | null;
    state?: string | null;
    city?: string | null;
    annual_budget_range?: string | null;
    organization_age_range?: string | null;
    preferred_grant_amount?: string | null;
    preferred_grant_types?: string[] | null;
    accept_government_grants?: boolean | null;
    onboarding_step?: number | null;
  } | null,
): OnboardingFormValues {
  if (!organization) {
    return {
      has_501c3: false,
      accept_government_grants: true,
      mission_categories: [],
      populations_served: [],
      preferred_grant_types: [],
      city: "",
    };
  }

  return {
    organization_name: organization.organization_name ?? "",
    organization_type: (organization.organization_type as OnboardingStep1Input["organization_type"]) ?? "501(c)(3) Nonprofit",
    has_501c3: organization.has_501c3 ?? organization.is_501c3 ?? false,
    mission_categories: (organization.mission_categories ?? []) as OnboardingStep2Input["mission_categories"],
    populations_served: (organization.populations_served ?? []) as OnboardingStep3Input["populations_served"],
    state: organization.state ?? "",
    city: organization.city ?? "",
    annual_budget_range: organization.annual_budget_range as OnboardingStep5Input["annual_budget_range"] | undefined,
    organization_age_range: organization.organization_age_range as OnboardingStep5Input["organization_age_range"] | undefined,
    preferred_grant_amount: organization.preferred_grant_amount as OnboardingStep6Input["preferred_grant_amount"] | undefined,
    preferred_grant_types: (organization.preferred_grant_types ?? []) as OnboardingStep6Input["preferred_grant_types"],
    accept_government_grants: organization.accept_government_grants ?? true,
    onboarding_step: organization.onboarding_step ?? 1,
  };
}
