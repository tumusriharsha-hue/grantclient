"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { saveOrganizationProfile } from "@/app/actions/organization";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import type { OrganizationProfileInput } from "@/lib/validations/organization";
import { cn } from "@/lib/utils";
import type { Organization } from "@/types/database";
import {
  FOCUS_AREAS,
  ORGANIZATION_TYPES,
  normalizeOrganizationType,
  type FocusArea,
} from "@/types/organization";

interface OrganizationProfileFormProps {
  organization?: Organization | null;
  canEditProfile: boolean;
  isGuest: boolean;
}

const organizationTypeOptions = ORGANIZATION_TYPES.map((type) => ({
  value: type,
  label: type,
}));

export function OrganizationProfileForm({
  organization,
  canEditProfile,
  isGuest,
}: OrganizationProfileFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<OrganizationProfileInput>({
    defaultValues: {
      organization_name: organization?.organization_name ?? "",
      mission: organization?.mission ?? "",
      location: organization?.location ?? "",
      organization_type: normalizeOrganizationType(organization?.organization_type),
      keywords: (organization?.keywords ?? []) as FocusArea[],
      budget: organization?.budget ?? "",
      is_501c3: organization?.is_501c3 ?? false,
    },
  });

  const selectedKeywords = useWatch({ control, name: "keywords" }) ?? [];

  function toggleKeyword(area: FocusArea) {
    const next = selectedKeywords.includes(area)
      ? selectedKeywords.filter((item) => item !== area)
      : [...selectedKeywords, area];

    setValue("keywords", next, { shouldValidate: true });
  }

  async function onSubmit(values: OrganizationProfileInput) {
    if (!canEditProfile) {
      setSubmitError(
        isGuest
          ? "Create a free account to set up your organization profile."
          : "Sign in to save your organization profile.",
      );
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    const result = await saveOrganizationProfile(values);

    setIsSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof OrganizationProfileInput, { message });
        }
      }
      setSubmitError(result.error);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-primary">Step 1 of 1</p>
        <h1 className="mt-2 text-2xl font-bold text-text">
          Set up your organization
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          This takes under 2 minutes. Your profile powers deterministic grant
          matching — no tax IDs, documents, or contact info needed.
        </p>
      </div>

      {!canEditProfile && (
        <Card padding="md" className="mb-6 border-primary/20 bg-primary-light/10">
          <p className="text-sm text-text-secondary">
            {isGuest ? (
              <>
                Guest mode is read-only.{" "}
                <Link href="/signup?reason=account" className="font-medium text-primary hover:underline">
                  Create a free account
                </Link>{" "}
                to set up your organization profile.
              </>
            ) : (
              <>
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>{" "}
                or{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  create an account
                </Link>{" "}
                to save your profile.
              </>
            )}
          </p>
        </Card>
      )}

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Organization Name *"
            placeholder="Urban Reach Initiative"
            error={errors.organization_name?.message}
            {...register("organization_name")}
          />

          <Textarea
            label="Mission Statement *"
            rows={4}
            placeholder="What change does your organization create in the community?"
            hint="One or two sentences is enough."
            error={errors.mission?.message}
            {...register("mission")}
          />

          <Input
            label="Location *"
            placeholder="Brooklyn, NY"
            error={errors.location?.message}
            {...register("location")}
          />

          <Select
            label="Organization Type *"
            options={organizationTypeOptions}
            error={errors.organization_type?.message}
            {...register("organization_type")}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-text">Keywords / Focus Areas *</p>
            <p className="text-xs text-text-muted">
              Select all areas that describe your work.
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FOCUS_AREAS.map((area) => (
                <label
                  key={area}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors",
                    selectedKeywords.includes(area)
                      ? "border-primary bg-primary-light/40 text-primary"
                      : "border-border text-text-secondary hover:border-border-hover",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedKeywords.includes(area)}
                    onChange={() => toggleKeyword(area)}
                    className="rounded"
                  />
                  {area}
                </label>
              ))}
            </div>
            {errors.keywords?.message && (
              <p className="text-xs text-danger">{errors.keywords.message}</p>
            )}
          </div>

          <Input
            label="Annual Budget"
            type="number"
            min={0}
            step={1}
            placeholder="250000"
            hint="Optional. Whole dollars only."
            error={errors.budget?.message}
            {...register("budget")}
          />

          <label className="flex items-start gap-3 rounded-md border border-border px-4 py-3">
            <input
              type="checkbox"
              className="mt-0.5 rounded"
              {...register("is_501c3")}
            />
            <span>
              <span className="block text-sm font-medium text-text">
                501(c)(3) Status
              </span>
              <span className="mt-0.5 block text-xs text-text-muted">
                Optional. Check if your organization has 501(c)(3) tax-exempt status.
              </span>
            </span>
          </label>

          {submitError && (
            <p className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger-dark">
              {submitError}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting || !canEditProfile}>
              {isSubmitting
                ? "Saving..."
                : organization
                  ? "Save profile"
                  : "Complete setup"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
