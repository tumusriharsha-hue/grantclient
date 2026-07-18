import type { GrantRow, TablesInsert } from "@/types/database";
import { sanitizeGrantText } from "@/lib/grants/sanitize-text";
import type { Grant } from "@/types/grant";

export function mapGrantRow(row: GrantRow): Grant {
  return {
    id: row.id,
    title: sanitizeGrantText(row.title),
    description: sanitizeGrantText(row.description),
    funder: sanitizeGrantText(row.funder),
    category: row.category as Grant["category"],
    region: row.region as Grant["region"],
    status: row.status as Grant["status"],
    amount: row.amount ?? undefined,
    awardMin: row.award_min ?? row.amount ?? undefined,
    awardMax: row.award_max ?? row.amount ?? undefined,
    deadline: row.deadline ?? undefined,
    rollingDeadline: row.rolling_deadline,
    eligibilitySummary: row.eligibility_summary ?? undefined,
    eligibleOrganizationTypes: row.eligible_organization_types ?? undefined,
    requiredNonprofitStatus: row.required_nonprofit_status ?? undefined,
    eligibleLocations: row.eligible_locations ?? undefined,
    geographicScope: row.geographic_scope ?? undefined,
    focusAreas: row.focus_areas ?? undefined,
    populationsServed: row.populations_served ?? undefined,
    minimumAnnualBudget: row.minimum_annual_budget ?? undefined,
    maximumAnnualBudget: row.maximum_annual_budget ?? undefined,
    minimumRequestAmount: row.minimum_request_amount ?? undefined,
    maximumRequestAmount: row.maximum_request_amount ?? undefined,
    requirements: row.requirements ?? undefined,
    requiredDocuments: row.required_documents ?? undefined,
    applicationQuestions: Array.isArray(row.application_questions)
      ? (row.application_questions as Grant["applicationQuestions"])
      : undefined,
    sourceUrl: row.source_url ?? undefined,
    verifiedAt: row.verified_at ?? undefined,
    applicationUrl: row.application_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGrantToInsert(grant: Grant): TablesInsert<"grants"> {
  return {
    id: grant.id,
    title: grant.title,
    description: grant.description,
    funder: grant.funder,
    category: grant.category,
    region: grant.region,
    status: grant.status,
    amount: grant.amount ?? null,
    award_min: grant.awardMin ?? grant.amount ?? null,
    award_max: grant.awardMax ?? grant.amount ?? null,
    deadline: grant.deadline ?? null,
    rolling_deadline: grant.rollingDeadline ?? false,
    eligibility_summary: grant.eligibilitySummary ?? null,
    eligible_organization_types: grant.eligibleOrganizationTypes ?? null,
    required_nonprofit_status: grant.requiredNonprofitStatus ?? null,
    eligible_locations: grant.eligibleLocations ?? null,
    geographic_scope: grant.geographicScope ?? null,
    focus_areas: grant.focusAreas ?? [grant.category],
    populations_served: grant.populationsServed ?? null,
    minimum_annual_budget: grant.minimumAnnualBudget ?? null,
    maximum_annual_budget: grant.maximumAnnualBudget ?? null,
    minimum_request_amount: grant.minimumRequestAmount ?? null,
    maximum_request_amount: grant.maximumRequestAmount ?? null,
    requirements: grant.requirements ?? null,
    required_documents: grant.requiredDocuments ?? null,
    application_questions: grant.applicationQuestions ?? null,
    source_url: grant.sourceUrl ?? null,
    verified_at: grant.verifiedAt ?? null,
    application_url: grant.applicationUrl,
    created_at: grant.createdAt,
    updated_at: grant.updatedAt,
  };
}
