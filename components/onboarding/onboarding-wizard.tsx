"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveOnboardingProgress } from "@/app/actions/organization";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { ChipSelect } from "@/components/onboarding/chip-select";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { StateSelect } from "@/components/onboarding/state-select";
import {
  organizationToOnboardingValues,
  type OnboardingFormValues,
} from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/database";
import {
  MISSION_CATEGORIES,
  ONBOARDING_STEPS,
  ORGANIZATION_AGE_RANGES,
  ORGANIZATION_TYPES,
  POPULATIONS_SERVED,
  PREFERRED_GRANT_TYPES,
  TOTAL_ONBOARDING_STEPS,
  type OrganizationType,
} from "@/types/organization";

interface OnboardingWizardProps {
  organization: Organization | null;
  canEditProfile: boolean;
  isGuest: boolean;
  mode?: "onboarding" | "settings";
  onComplete?: () => void;
}

export function OnboardingWizard({
  organization,
  canEditProfile,
  isGuest,
  mode = "onboarding",
  onComplete,
}: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(
    mode === "settings" ? 1 : (organization?.onboarding_step ?? 1),
  );
  const [values, setValues] = useState<OnboardingFormValues>(() =>
    organizationToOnboardingValues(organization),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const currentStep = ONBOARDING_STEPS[step - 1];

  function updateValues(partial: Partial<OnboardingFormValues>) {
    setValues((current) => ({ ...current, ...partial }));
    setSaveMessage(null);
  }

  async function persist(
    savedStep: number,
    complete = false,
    validationStep = savedStep,
  ) {
    if (!canEditProfile) {
      setSubmitError(
        isGuest
          ? "Create a free account to set up your organization profile."
          : "Sign in to save your organization profile.",
      );
      return false;
    }

    setIsSaving(true);
    setSubmitError(null);
    setFieldErrors({});

    const result = await saveOnboardingProgress(
      values,
      savedStep,
      complete,
      validationStep,
    );
    setIsSaving(false);

    if (!result.success) {
      setSubmitError(result.error);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
      return false;
    }

    setSaveMessage("Progress saved");
    return true;
  }

  async function handleNext() {
    const nextStep = Math.min(step + 1, TOTAL_ONBOARDING_STEPS);
    const saved = await persist(nextStep, false, step);
    if (!saved) return;

    if (step < TOTAL_ONBOARDING_STEPS) {
      setStep(nextStep);
      return;
    }

    await handleFinish();
  }

  async function handleFinish() {
    const saved = await persist(TOTAL_ONBOARDING_STEPS, true);
    if (!saved) return;

    if (onComplete) {
      onComplete();
      return;
    }

    if (mode === "settings") {
      setSaveMessage("Profile updated successfully");
      return;
    }

    router.refresh();
  }

  async function handleBack() {
    if (step === 1) return;
    setStep(step - 1);
    setFieldErrors({});
    setSubmitError(null);
  }

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <Input
              label="Organization Name"
              value={values.organization_name ?? ""}
              onChange={(event) =>
                updateValues({ organization_name: event.target.value })
              }
              error={fieldErrors.organization_name}
              disabled={!canEditProfile}
              required
            />
            <Select
              label="Organization Type"
              value={values.organization_type ?? "501(c)(3) Nonprofit"}
              onChange={(event) =>
                updateValues({
                  organization_type: event.target.value as OrganizationType,
                })
              }
              options={ORGANIZATION_TYPES.map((type) => ({
                value: type,
                label: type,
              }))}
              error={fieldErrors.organization_type}
              disabled={!canEditProfile}
            />
            <Select
              label="Do you have official 501(c)(3) status?"
              value={values.has_501c3 === undefined ? "" : values.has_501c3 ? "yes" : "no"}
              onChange={(event) =>
                updateValues({ has_501c3: event.target.value === "yes" })
              }
              options={[
                { value: "", label: "Select yes or no" },
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              error={fieldErrors.has_501c3}
              disabled={!canEditProfile}
              required
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <Textarea
              label="Mission Statement"
              rows={4}
              value={values.mission ?? ""}
              onChange={(event) => updateValues({ mission: event.target.value })}
              error={fieldErrors.mission}
              disabled={!canEditProfile}
              required
            />
            <ChipSelect
              options={MISSION_CATEGORIES}
              value={values.mission_categories ?? []}
              onChange={(mission_categories) => updateValues({ mission_categories })}
              disabled={!canEditProfile}
              error={fieldErrors.mission_categories}
            />
            <Textarea
              label="Programs"
              rows={3}
              value={(values.programs ?? []).join("\n")}
              onChange={(event) => updateValues({
                // Preserve spaces while typing; onboarding validation trims entries on save.
                programs: event.target.value.split("\n"),
              })}
              hint="Enter at least one program, with one program per line."
              disabled={!canEditProfile}
            />
            <Textarea
              label="Impact Goals (optional)"
              rows={3}
              value={values.impact_goals ?? ""}
              onChange={(event) => updateValues({ impact_goals: event.target.value })}
              disabled={!canEditProfile}
            />
          </div>
        );
      case 3:
        return (
          <ChipSelect
            options={POPULATIONS_SERVED}
            value={values.populations_served ?? []}
            onChange={(populations_served) => updateValues({ populations_served })}
            disabled={!canEditProfile}
            error={fieldErrors.populations_served}
          />
        );
      case 4:
        return (
          <div className="space-y-5">
            <StateSelect
              value={values.state ?? ""}
              onChange={(state) => updateValues({ state })}
              disabled={!canEditProfile}
              error={fieldErrors.state}
            />
            <Input
              label="City (optional)"
              value={values.city ?? ""}
              onChange={(event) => updateValues({ city: event.target.value })}
              disabled={!canEditProfile}
              placeholder="e.g. Austin"
            />
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <Input
              label="Annual Budget"
              type="number"
              min={0}
              step={1}
              value={values.budget ?? ""}
              onChange={(event) =>
                updateValues({ budget: event.target.value ? Number(event.target.value) : undefined })
              }
              error={fieldErrors.budget}
              disabled={!canEditProfile}
              required
            />
            <Select
              label="Years Operating"
              value={values.organization_age_range ?? ""}
              onChange={(event) =>
                updateValues({
                  organization_age_range: event.target
                    .value as OnboardingFormValues["organization_age_range"],
                })
              }
              options={[
                { value: "", label: "Select a range" },
                ...ORGANIZATION_AGE_RANGES.map((range) => ({
                  value: range,
                  label: range,
                })),
              ]}
              error={fieldErrors.organization_age_range}
              disabled={!canEditProfile}
            />
            <Input
              label="Website (optional)"
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              value={values.website ?? ""}
              onChange={(event) => updateValues({ website: event.target.value })}
              error={fieldErrors.website}
              disabled={!canEditProfile}
            />
            <Textarea
              label="Previous Grant Experience (optional)"
              rows={3}
              value={values.previous_grant_experience ?? ""}
              onChange={(event) => updateValues({ previous_grant_experience: event.target.value })}
              disabled={!canEditProfile}
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Minimum Funding Request"
                type="number"
                min={0}
                step={1}
                value={values.requested_funding_min ?? ""}
                onChange={(event) => updateValues({
                  requested_funding_min: event.target.value ? Number(event.target.value) : undefined,
                })}
                  error={fieldErrors.requested_funding_min}
                  disabled={!canEditProfile}
                  required
              />
              <Input
                label="Maximum Funding Request"
                type="number"
                min={1}
                step={1}
                value={values.requested_funding_max ?? ""}
                onChange={(event) => updateValues({
                  requested_funding_max: event.target.value ? Number(event.target.value) : undefined,
                })}
                  error={fieldErrors.requested_funding_max}
                  disabled={!canEditProfile}
                  required
              />
            </div>
            <div>
              <p className="mb-2 block text-sm font-medium text-text">Grant Types</p>
              <ChipSelect
                options={PREFERRED_GRANT_TYPES}
                value={values.preferred_grant_types ?? []}
                onChange={(preferred_grant_types) =>
                  updateValues({ preferred_grant_types })
                }
                disabled={!canEditProfile}
                error={fieldErrors.preferred_grant_types}
              />
            </div>
            <label className="flex items-center justify-between rounded-md border border-border bg-bg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text">
                  I am open to government grant opportunities
                </p>
              </div>
              <input
                type="checkbox"
                checked={values.accept_government_grants ?? true}
                onChange={(event) =>
                  updateValues({ accept_government_grants: event.target.checked })
                }
                disabled={!canEditProfile}
                className="h-5 w-5 rounded border-border"
              />
            </label>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div
      className={cn(
        "w-full",
        mode === "onboarding" ? "mx-auto max-w-2xl px-4 py-8" : "p-0",
      )}
    >
      {mode === "onboarding" && (
        <div className="mb-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Organization setup
          </p>
          <h1 className="mt-2 text-2xl font-bold text-text">
            {currentStep?.subtitle}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Takes about 3 minutes. Your answers power grant recommendations.
          </p>
        </div>
      )}

      <Card padding="lg" className="space-y-6">
        <OnboardingProgress step={step} />

        {!canEditProfile && (
          <div className="rounded-md bg-primary-light/20 px-4 py-3 text-sm text-text-secondary">
            {isGuest ? (
              <>
                Guest setup is temporary testing data. Create an account to keep your organization profile.{" "}
                <Link href="/signup?reason=account" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              "Sign in to save your organization profile."
            )}
          </div>
        )}

        {renderStep()}

        {submitError && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger-dark">
            {submitError}
          </p>
        )}

        {saveMessage && (
          <p className="text-xs text-success-dark">{saveMessage}</p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isSaving}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={step === TOTAL_ONBOARDING_STEPS ? handleFinish : handleNext}
            disabled={isSaving || !canEditProfile}
          >
            {isSaving
              ? "Saving..."
              : step === TOTAL_ONBOARDING_STEPS
                ? mode === "settings"
                  ? "Save changes"
                  : "Finish setup"
                : "Continue"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
