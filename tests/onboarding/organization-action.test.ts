import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser },
  })),
}));

import { saveOnboardingProgress } from "@/app/actions/organization";

const step1Values = {
  organization_name: "Community Learning Center",
  organization_type: "501(c)(3) Nonprofit" as const,
  has_501c3: true,
};

const initialFormValues = {
  ...step1Values,
  mission: "",
  programs: [],
  impact_goals: "",
  mission_categories: [],
  populations_served: [],
  city: "",
  previous_grant_experience: "",
  website: "",
  preferred_grant_types: [],
  accept_government_grants: true,
};

const expiredSessionError = {
  success: false,
  error: "Your session has expired. Please sign in again to save your profile.",
};

describe("saveOnboardingProgress", () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it("does not throw while parsing partial step values", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(saveOnboardingProgress(step1Values, 1, false, 1)).resolves.toEqual(
      expiredSessionError,
    );
  });

  it("accepts untouched empty later-step fields during step-one saves", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    await expect(
      saveOnboardingProgress(initialFormValues, 2, false, 1),
    ).resolves.toEqual(expiredSessionError);
  });

  it("returns a safe error for an invalid refresh token", async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: {
        code: "refresh_token_not_found",
        message: "Invalid Refresh Token: Refresh Token Not Found",
      },
    });

    const result = await saveOnboardingProgress(step1Values, 1, false, 1);

    expect(result).toEqual(expiredSessionError);
    expect(JSON.stringify(result)).not.toContain("refresh_token");
  });

  it("handles an auth client exception without leaving the action rejected", async () => {
    getUser.mockRejectedValue(new Error("Invalid Refresh Token"));

    await expect(saveOnboardingProgress(step1Values, 1, false, 1)).resolves.toEqual(
      expiredSessionError,
    );
  });

  it("clears the saving state when the save action fails", () => {
    const source = readFileSync(
      resolve(process.cwd(), "components/onboarding/onboarding-wizard.tsx"),
      "utf8",
    );

    expect(source).toMatch(
      /try\s*\{[\s\S]*saveOnboardingProgress[\s\S]*catch[\s\S]*setSubmitError[\s\S]*finally\s*\{\s*setIsSaving\(false\);/,
    );
  });
});
