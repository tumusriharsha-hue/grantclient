import { SOURCE_ALLOWLIST } from "../config";
import { contentHash, isRollingText, normalizeUrl, parseDate, parseFundingRange, stripUnsafeHtml } from "../normalize";
import type { GrantSourceAdapter, NormalizedGrantRecord } from "../types";

function stringValue(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseElectronicSubmission(value: string | null) {
  return value?.match(/https:\/\/[^;\s]+/i)?.[0] ?? null;
}

export const californiaGrantsPortalAdapter: GrantSourceAdapter = {
  sourceName: "california_grants_portal",
  compliance: SOURCE_ALLOWLIST.california_grants_portal,

  async fetchRecords() {
    if (!this.compliance.enabled) return [];
    throw new Error("California adapter is disabled pending robots.txt clarification.");
  },

  async normalize(record, now = new Date()) {
    const sourceRecordId = stringValue(record, "PortalID") ?? stringValue(record, "GrantID");
    const grantName = stringValue(record, "Title");
    const funderName = stringValue(record, "AgencyDept");
    if (!sourceRecordId || !grantName || !funderName) return null;
    const applicantType = stringValue(record, "ApplicantType") ?? "";
    const eligibilitySummary = stripUnsafeHtml(
      [applicantType, stringValue(record, "ApplicantTypeNotes")].filter(Boolean).join(" — "),
    );
    const description = stripUnsafeHtml(
      stringValue(record, "Description") ?? stringValue(record, "Purpose") ?? "",
    );
    const deadlineText = stringValue(record, "ApplicationDeadline") ?? "";
    const rolling = isRollingText(deadlineText);
    const deadline = rolling ? null : parseDate(deadlineText);
    const sourceUrl = normalizeUrl(stringValue(record, "GrantURL"));
    const applicationUrl = normalizeUrl(parseElectronicSubmission(stringValue(record, "ElecSubmission"))) ?? sourceUrl;
    if (!sourceUrl || !applicationUrl) return null;
    const amounts = parseFundingRange(stringValue(record, "EstAmounts"));
    const totalFunding = parseFundingRange(stringValue(record, "EstAvailFunds"));
    const checkedAt = now.toISOString();
    const safeRaw = {
      PortalID: sourceRecordId,
      Status: stringValue(record, "Status"),
      ApplicantType: applicantType,
      Type: stringValue(record, "Type"),
      LastUpdated: stringValue(record, "LastUpdated"),
    };
    const normalized: Omit<NormalizedGrantRecord, "contentHash"> = {
      id: `california-grants-portal-${sourceRecordId}`,
      source: "california_grants_portal",
      sourceRecordId,
      sourceUrl,
      sourceApplicationUrl: applicationUrl,
      grantName: stripUnsafeHtml(grantName),
      funderName: stripUnsafeHtml(funderName),
      funderType: "state_agency",
      description,
      summary: stripUnsafeHtml(stringValue(record, "Purpose") ?? "") || null,
      eligibilitySummary,
      eligibleOrganizationTypes: applicantType.split(";").map((value) => value.trim()).filter(Boolean),
      nonprofitEligible: /\bnonprofit\b/i.test(applicantType),
      requires501c3: /501\s*\(?c\)?\s*\(?3\)?/i.test(eligibilitySummary) ? true : null,
      fiscalSponsorAllowed: /fiscal sponsor/i.test(eligibilitySummary) ? true : null,
      eligibleStates: ["CA"],
      eligibleCounties: [],
      eligibleCountries: ["US"],
      geographicScope: stringValue(record, "Geography"),
      focusAreas: (stringValue(record, "Categories") ?? "").split(";").map((value) => value.trim()).filter(Boolean),
      targetPopulations: [],
      programTypes: [stringValue(record, "Type") ?? "Grant"],
      minimumAward: amounts.minimum,
      maximumAward: amounts.maximum,
      estimatedAward: amounts.maximum,
      totalFundingAvailable: totalFunding.maximum,
      currency: "USD",
      deadline,
      deadlineType: rolling ? "rolling" : deadline ? "fixed" : "unknown",
      opensAt: parseDate(stringValue(record, "OpenDate")),
      letterOfIntentDeadline: null,
      rolling,
      recurring: false,
      frequency: null,
      matchingFundsRequired: /required/i.test(stringValue(record, "MatchingFunds") ?? "") && !/not required/i.test(stringValue(record, "MatchingFunds") ?? ""),
      applicationRequirements: [],
      requiredDocuments: [],
      contactName: null,
      contactEmail: null,
      contactPhone: null,
      status: rolling ? "rolling" : deadline ? "open" : "unverified",
      verificationStatus: "verified",
      verificationMethod: "official_dataset",
      verifiedAt: checkedAt,
      lastCheckedAt: checkedAt,
      firstSeenAt: checkedAt,
      publishedAt: parseDate(stringValue(record, "LastUpdated")),
      rawSourceData: safeRaw,
      category: "Community Development",
      region: "Western US",
    };
    return { ...normalized, contentHash: contentHash(normalized) };
  },
};
