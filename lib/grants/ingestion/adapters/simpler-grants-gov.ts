import { z } from "zod";
import { SOURCE_ALLOWLIST } from "../config";
import { fetchJson } from "../http";
import { contentHash, isRollingText, parseDate, stripUnsafeHtml } from "../normalize";
import type { GrantSourceAdapter, NormalizedGrantRecord, RawGrantRecord } from "../types";

const SEARCH_URL = "https://api.simpler.grants.gov/v1/opportunities/search";
const PAGE_SIZE = 100;

const summarySchema = z.object({
  additional_info_url: z.string().nullable().optional(),
  agency_contact_description: z.string().nullable().optional(),
  agency_email_address: z.string().nullable().optional(),
  applicant_eligibility_description: z.string().nullable().optional(),
  applicant_types: z.array(z.string()).default([]),
  award_ceiling: z.number().nullable().optional(),
  award_floor: z.number().nullable().optional(),
  close_date: z.string().nullable().optional(),
  close_date_description: z.string().nullable().optional(),
  estimated_total_program_funding: z.number().nullable().optional(),
  funding_categories: z.array(z.string()).default([]),
  funding_category_description: z.string().nullable().optional(),
  funding_instruments: z.array(z.string()).default([]),
  is_cost_sharing: z.boolean().nullable().optional(),
  post_date: z.string().nullable().optional(),
  summary_description: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
}).passthrough();

const opportunitySchema = z.object({
  opportunity_id: z.string().min(1),
  opportunity_number: z.string().nullable().optional(),
  opportunity_status: z.string(),
  opportunity_title: z.string().min(1),
  agency_name: z.string().min(1),
  top_level_agency_name: z.string().nullable().optional(),
  summary: summarySchema,
}).passthrough();

const responseSchema = z.object({
  data: z.array(z.record(z.string(), z.unknown())).default([]),
  pagination_info: z.object({ total_pages: z.number().int().nonnegative() }).passthrough(),
}).passthrough();

function getApiKey() {
  const apiKey = process.env.SIMPLER_GRANTS_API_KEY?.trim();
  if (!apiKey) throw new Error("SIMPLER_GRANTS_API_KEY is required for Simpler.Grants.gov ingestion.");
  return apiKey;
}

function sourceUrl(opportunityId: string) {
  return `https://simpler.grants.gov/opportunity/${encodeURIComponent(opportunityId)}`;
}

function mapCategory(categories: string[], description: string): string {
  const text = `${categories.join(" ")} ${description}`.toLowerCase();
  if (/education|humanities/.test(text)) return "Education";
  if (/health|medical|mental/.test(text)) return "Healthcare";
  if (/environment|natural resources|energy/.test(text)) return "Environment";
  if (/food|nutrition|agriculture/.test(text)) return "Food Security";
  if (/science|technology|research/.test(text)) return "STEM & Technology";
  if (/arts|culture/.test(text)) return "Arts & Culture";
  if (/community|housing|employment|labor/.test(text)) return "Community Development";
  return "Capacity Building";
}

function normalizeFocusAreas(categories: string[], description: string): string[] {
  const normalized = categories
    .map((value) => stripUnsafeHtml(value).trim())
    .filter((value) => value.length > 0 && value.length <= 80 && !/^n\/?a$/i.test(value))
    .map((value) => value
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase()));

  return [...new Set(normalized.length > 0 ? normalized : [mapCategory(categories, description)])];
}

function targetPopulations(text: string): string[] {
  const mappings: Array<[RegExp, string]> = [
    [/\byouth|young people|children|students\b/i, "Youth and students"],
    [/\btribal|native american|indigenous\b/i, "Tribal and Indigenous communities"],
    [/\bveteran/i, "Veterans"],
    [/\brural/i, "Rural communities"],
    [/\bdisabilit/i, "People with disabilities"],
    [/\blow[- ]income|underserved|disadvantaged/i, "Underserved communities"],
  ];
  return mappings.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}

function parseContactName(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.split(/[\r\n]/).map((part) => part.trim()).find((part) => part && !part.includes("@")) ?? null;
}

async function fetchPage(pageOffset: number): Promise<z.infer<typeof responseSchema>> {
  const payload = await fetchJson(SEARCH_URL, {
    method: "POST",
    requestDelayMs: pageOffset === 1 ? 0 : SOURCE_ALLOWLIST.simpler_grants_gov.requestDelayMs,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getApiKey(),
    },
    body: JSON.stringify({
      filters: {
        opportunity_status: { one_of: ["posted"] },
        funding_instrument: { one_of: ["grant", "cooperative_agreement"] },
        applicant_type: {
          one_of: [
            "nonprofits_non_higher_education_with_501c3",
            "nonprofits_non_higher_education_without_501c3",
            "unrestricted",
          ],
        },
      },
      pagination: {
        page_offset: pageOffset,
        page_size: PAGE_SIZE,
        sort_order: [{ order_by: "opportunity_id", sort_direction: "ascending" }],
      },
    }),
  });
  return responseSchema.parse(payload);
}

export const simplerGrantsGovAdapter: GrantSourceAdapter = {
  sourceName: "simpler_grants_gov",
  compliance: SOURCE_ALLOWLIST.simpler_grants_gov,

  async fetchRecords(options) {
    const firstPage = await fetchPage(1);
    const target = options?.limit ?? Number.POSITIVE_INFINITY;
    const records: RawGrantRecord[] = [...firstPage.data];
    const totalPages = Math.min(firstPage.pagination_info.total_pages, Math.ceil(target / PAGE_SIZE));

    for (let page = 2; page <= totalPages && records.length < target; page += 1) {
      const response = await fetchPage(page);
      records.push(...response.data);
    }
    return records.slice(0, target);
  },

  async normalize(rawRecord, now = new Date()) {
    const parsed = opportunitySchema.safeParse(rawRecord);
    if (!parsed.success) return null;
    const opportunity = parsed.data;
    const summary = opportunity.summary;
    const applicantTypes = summary.applicant_types;
    const nonprofitWith501c3 = applicantTypes.includes("nonprofits_non_higher_education_with_501c3");
    const nonprofitWithout501c3 = applicantTypes.includes("nonprofits_non_higher_education_without_501c3");
    const nonprofitEligible = nonprofitWith501c3 || nonprofitWithout501c3;
    const eligibilitySummary = stripUnsafeHtml(summary.applicant_eligibility_description ?? "");
    const description = stripUnsafeHtml(summary.summary_description ?? "");
    const deadline = parseDate(summary.close_date);
    const rolling = !deadline && isRollingText(summary.close_date_description ?? "");
    const officialUrl = sourceUrl(opportunity.opportunity_id);
    const checkedAt = now.toISOString();
    // Simpler sometimes puts long statutory or program prose in
    // funding_category_description. Keep that prose out of the taxonomy.
    const focusAreas = normalizeFocusAreas(
      summary.funding_categories,
      summary.funding_category_description ?? description,
    );
    const safeRaw = {
      opportunity_id: opportunity.opportunity_id,
      opportunity_number: opportunity.opportunity_number ?? null,
      opportunity_status: opportunity.opportunity_status,
      applicant_types: applicantTypes,
      funding_instruments: summary.funding_instruments,
      updated_at: summary.updated_at ?? null,
    };
    const record: Omit<NormalizedGrantRecord, "contentHash"> = {
      id: `simpler-grants-gov-${opportunity.opportunity_id}`,
      source: "simpler_grants_gov",
      sourceRecordId: opportunity.opportunity_id,
      sourceUrl: officialUrl,
      sourceApplicationUrl: officialUrl,
      grantName: stripUnsafeHtml(opportunity.opportunity_title),
      funderName: stripUnsafeHtml(opportunity.agency_name),
      funderType: "federal_agency",
      description,
      summary: description.slice(0, 500) || null,
      eligibilitySummary,
      eligibleOrganizationTypes: applicantTypes,
      nonprofitEligible,
      requires501c3: nonprofitWith501c3 && !nonprofitWithout501c3 ? true : nonprofitEligible ? false : null,
      fiscalSponsorAllowed: /fiscal sponsor/i.test(eligibilitySummary) ? true : null,
      eligibleStates: [],
      eligibleCounties: [],
      eligibleCountries: ["US"],
      geographicScope: "United States",
      focusAreas,
      targetPopulations: targetPopulations(`${description} ${eligibilitySummary}`),
      programTypes: summary.funding_instruments,
      minimumAward: summary.award_floor ?? null,
      maximumAward: summary.award_ceiling ?? null,
      estimatedAward: summary.award_ceiling ?? summary.award_floor ?? null,
      totalFundingAvailable: summary.estimated_total_program_funding ?? null,
      currency: "USD",
      deadline,
      deadlineType: rolling ? "rolling" : deadline ? "fixed" : "unknown",
      opensAt: parseDate(summary.post_date),
      letterOfIntentDeadline: null,
      rolling,
      recurring: false,
      frequency: null,
      matchingFundsRequired: summary.is_cost_sharing ?? null,
      applicationRequirements: [],
      requiredDocuments: [],
      contactName: parseContactName(summary.agency_contact_description),
      contactEmail: summary.agency_email_address ?? null,
      contactPhone: null,
      status: rolling ? "rolling" : deadline ? "open" : "unverified",
      verificationStatus: "verified",
      verificationMethod: "official_api",
      verifiedAt: checkedAt,
      lastCheckedAt: checkedAt,
      firstSeenAt: summary.post_date ? new Date(`${summary.post_date}T00:00:00.000Z`).toISOString() : checkedAt,
      publishedAt: summary.post_date ? new Date(`${summary.post_date}T00:00:00.000Z`).toISOString() : null,
      rawSourceData: safeRaw,
      category: mapCategory(focusAreas, description),
      region: "National",
    };
    return { ...record, contentHash: contentHash(record) };
  },
};
