import { describe, expect, it } from "vitest";
import {
  normalizeOptionalWebsite,
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
