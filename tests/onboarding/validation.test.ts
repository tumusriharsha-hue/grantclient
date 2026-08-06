import { describe, expect, it } from "vitest";
import {
  normalizeOptionalWebsite,
  onboardingCompleteSchema,
  onboardingPartialSchema,
  onboardingStep6Schema,
  onboardingStep5Schema,
  organizationToOnboardingValues,
  validateOnboardingStep,
} from "@/lib/validations/onboarding";
import {
  normalizeOrganizationType,
  organizationTypeToStorageValue,
} from "@/types/organization";

const validStep5Values = {
  budget: 100000,
  organization_age_range: "1–3 years" as const,
};

describe("onboarding validation", () => {
  it("parses partial onboarding values without applying complete-form refinements", () => {
    const result = onboardingPartialSchema.safeParse({
      organization_name: "Community Learning Center",
      organization_type: "501(c)(3) Nonprofit",
      has_501c3: true,
    });

    expect(result.success).toBe(true);
  });

  it("keeps the funding-range rule on the complete schema", () => {
    const result = onboardingCompleteSchema.safeParse({
      organization_name: "Community Learning Center",
      organization_type: "501(c)(3) Nonprofit",
      has_501c3: true,
      mission: "We provide accessible education and mentoring for youth.",
      programs: ["After-school tutoring"],
      impact_goals: "",
      mission_categories: ["Education"],
      populations_served: ["Children (0–12)"],
      state: "TX",
      city: "Austin",
      budget: 100000,
      organization_age_range: "1–3 years",
      previous_grant_experience: "",
      website: "",
      requested_funding_min: 50000,
      requested_funding_max: 25000,
      preferred_grant_types: ["General Operating Support"],
      accept_government_grants: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: ["requested_funding_max"],
        message: "Maximum request must be at least the minimum request",
      }));
    }
  });

  it("validates the same funding-range rule during step-six validation", () => {
    const result = onboardingStep6Schema.safeParse({
      requested_funding_min: 50000,
      requested_funding_max: 25000,
      preferred_grant_types: ["General Operating Support"],
      accept_government_grants: true,
    });

    expect(result.success).toBe(false);
  });

  it("allows optional website and grant experience fields to be empty", () => {
    const result = validateOnboardingStep(5, {
      ...validStep5Values,
      annual_budget_range: "" as never,
      website: "",
      previous_grant_experience: "",
    });

    expect(result.success).toBe(true);
  });

  it("ignores stale blank values for hidden optional fields", () => {
    const result = validateOnboardingStep(5, {
      budget: 700,
      annual_budget_range: "" as never,
      organization_age_range: "3–5 years",
      website: "",
      previous_grant_experience: "",
    });

    expect(result.success).toBe(true);
  });

  it("ignores stale null values for hidden optional fields", () => {
    const result = validateOnboardingStep(5, {
      budget: 700,
      annual_budget_range: null as never,
      organization_age_range: "1–3 years",
      website: "",
      previous_grant_experience: "",
    });

    expect(result.success).toBe(true);
  });

  it("normalizes a bare website domain before validating it", () => {
    const result = onboardingStep5Schema.safeParse({
      ...validStep5Values,
      website: "powerplaynpo.org",
      previous_grant_experience: "Has applied for local grants.",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBe("https://powerplaynpo.org");
    }
    expect(normalizeOptionalWebsite(" powerplaynpo.org ")).toBe("https://powerplaynpo.org");
  });

  it("maps legacy organization types into nonprofit-only profile choices", () => {
    expect(normalizeOrganizationType("School")).toBe("Other Nonprofit");
    expect(normalizeOrganizationType("Religious Organization")).toBe("Faith-Based Nonprofit");
    expect(normalizeOrganizationType("Community Group")).toBe("Community Nonprofit");
    expect(organizationTypeToStorageValue("Other Nonprofit")).toBe("Other");
  });

  it("does not show a legacy type when reopening onboarding", () => {
    const values = organizationToOnboardingValues({
      organization_name: "Community Learning Center",
      organization_type: "University",
    });

    expect(values.organization_type).toBe("Other Nonprofit");
  });
});
