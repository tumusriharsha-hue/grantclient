import { getRegionsForState } from "@/lib/onboarding/us-states";
import type { EligibilityResult } from "@/lib/grants/matching-types";
import type { Organization } from "@/types/database";
import type { Grant } from "@/types/grant";
import { isActionableGrant } from "@/lib/grants/status";
import { calculateFundingFit } from "@/lib/grants/fit";

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hasOverlap(left: string[], right: string[]): boolean {
  const normalized = new Set(left.map(normalize));
  return right.some((value) => normalized.has(normalize(value)));
}

export function getDesiredFundingRange(organization: Organization): {
  min: number | null;
  max: number | null;
} {
  if (
    organization.requested_funding_min !== null ||
    organization.requested_funding_max !== null
  ) {
    return {
      min: organization.requested_funding_min,
      max: organization.requested_funding_max,
    };
  }

  switch (organization.preferred_grant_amount) {
    case "Under $5,000":
      return { min: 0, max: 4999 };
    case "$5,000–$25,000":
      return { min: 5000, max: 25000 };
    case "$25,000–$100,000":
      return { min: 25001, max: 100000 };
    case "$100,000+":
      return { min: 100000, max: null };
    default:
      return { min: null, max: null };
  }
}

export function getGrantAwardRange(grant: Grant): {
  min: number | null;
  max: number | null;
} {
  return {
    min: grant.awardMin ?? grant.typicalAward ?? grant.amount ?? null,
    max: grant.awardMax ?? grant.typicalAward ?? grant.amount ?? null,
  };
}

function rangesOverlap(
  first: { min: number | null; max: number | null },
  second: { min: number | null; max: number | null },
): boolean {
  const firstMin = first.min ?? 0;
  const firstMax = first.max ?? Number.POSITIVE_INFINITY;
  const secondMin = second.min ?? 0;
  const secondMax = second.max ?? Number.POSITIVE_INFINITY;
  return firstMin <= secondMax && secondMin <= firstMax;
}

function nonprofitStatus(organization: Organization): string | null {
  if (organization.nonprofit_status) return organization.nonprofit_status;
  if (organization.has_501c3 ?? organization.is_501c3) return "501c3";
  return null;
}

function meetsNonprofitRequirement(actual: string, required: string): boolean {
  const normalizedActual = normalize(actual);
  const normalizedRequired = normalize(required);
  if (normalizedRequired === "none") return true;
  if (normalizedRequired === "nonprofit") {
    return normalizedActual === "nonprofit" || normalizedActual === "501c3";
  }
  return normalizedActual === normalizedRequired;
}

function organizationLocations(organization: Organization): string[] {
  const values = [
    organization.state,
    organization.city,
    organization.location,
    ...(organization.geographic_service_area ?? []),
  ].filter((value): value is string => Boolean(value));

  if (organization.state) {
    values.push(...getRegionsForState(organization.state));
  }

  return values;
}

export function filterGrantEligibility(
  organization: Organization,
  grant: Grant,
  now = new Date(),
): EligibilityResult {
  const rejectionReasons: string[] = [];
  const verificationItems: string[] = [];

  if (!isActionableGrant(grant, now)) {
    rejectionReasons.push("Grant is not currently actionable");
  }

  if (!grant.rollingDeadline) {
    if (!grant.deadline) {
      verificationItems.push("Confirm the application deadline");
    } else {
      const deadline = new Date(`${grant.deadline}T23:59:59.999Z`);
      if (Number.isNaN(deadline.getTime())) {
        verificationItems.push("Confirm the application deadline");
      } else if (deadline.getTime() < now.getTime()) {
        rejectionReasons.push("Application deadline has passed");
      }
    }
  }

  if (
    grant.eligibleOrganizationTypes?.length &&
    !hasOverlap(grant.eligibleOrganizationTypes, [organization.organization_type])
  ) {
    rejectionReasons.push("Organization type is not eligible");
  }

  if (grant.requiredNonprofitStatus) {
    const required = normalize(grant.requiredNonprofitStatus);
    const actual = nonprofitStatus(organization);
    if (!actual) {
      verificationItems.push("Confirm required nonprofit or tax status");
    } else if (!meetsNonprofitRequirement(actual, required)) {
      rejectionReasons.push("Required nonprofit or tax status is not met");
    }
  }

  const locations = organizationLocations(organization);
  const restrictions = grant.eligibleLocations?.length
    ? grant.eligibleLocations
    : grant.region
      ? [grant.region]
      : [];
  const unrestricted = restrictions.some((value) =>
    ["national", "nationwide", "unitedstates", "us", "usa"].includes(normalize(value)),
  );
  if (restrictions.length > 0 && !unrestricted) {
    if (locations.length === 0) {
      verificationItems.push("Confirm geographic eligibility");
    } else if (!hasOverlap(restrictions, locations)) {
      rejectionReasons.push("Organization location is outside the eligible geography");
    }
  }

  if (
    grant.minimumAnnualBudget !== undefined &&
    organization.budget !== null &&
    organization.budget < grant.minimumAnnualBudget
  ) {
    rejectionReasons.push("Annual budget is below the grant minimum");
  }
  if (
    grant.maximumAnnualBudget !== undefined &&
    organization.budget !== null &&
    organization.budget > grant.maximumAnnualBudget
  ) {
    rejectionReasons.push("Annual budget is above the grant maximum");
  }
  if (
    (grant.minimumAnnualBudget !== undefined || grant.maximumAnnualBudget !== undefined) &&
    organization.budget === null
  ) {
    verificationItems.push("Confirm annual budget eligibility");
  }

  const desired = getDesiredFundingRange(organization);
  const award = getGrantAwardRange(grant);
  if (
    (desired.min !== null || desired.max !== null) &&
    (award.min !== null || award.max !== null) &&
    ["below_range", "above_range"].includes(calculateFundingFit(desired, award).status)
  ) {
    rejectionReasons.push("Award range does not overlap the desired funding range");
  }
  const requestRules = {
    min: grant.minimumRequestAmount ?? null,
    max: grant.maximumRequestAmount ?? null,
  };
  if (
    (desired.min !== null || desired.max !== null) &&
    (requestRules.min !== null || requestRules.max !== null) &&
    !rangesOverlap(desired, requestRules)
  ) {
    rejectionReasons.push("Desired request does not meet the grant's request limits");
  }

  if (rejectionReasons.length > 0) {
    return {
      status: "ineligible",
      eligible: false,
      rejectionReasons,
      verificationItems,
    };
  }

  if (verificationItems.length > 0) {
    return {
      status: "needs_verification",
      eligible: true,
      rejectionReasons,
      verificationItems,
    };
  }

  return {
    status: grant.verifiedAt ? "eligible" : "likely_eligible",
    eligible: true,
    rejectionReasons,
    verificationItems: grant.verifiedAt
      ? []
      : ["Funder eligibility details have not been recently verified; confirm them on the grant page"],
  };
}

export function filterEligibleGrants(
  organization: Organization,
  grants: Grant[],
  now = new Date(),
): Array<{ grant: Grant; eligibility: EligibilityResult }> {
  return grants
    .map((grant) => ({ grant, eligibility: filterGrantEligibility(organization, grant, now) }))
    .filter((result) => result.eligibility.eligible);
}
