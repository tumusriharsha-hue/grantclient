import type { SourceCompliance } from "./types";

export const INGESTION_USER_AGENT =
  "GrantClient-GrantIngestion/1.0 (+https://grantclient.com; grants@grantclient.com)";

export const SOURCE_ALLOWLIST: Record<string, SourceCompliance> = {
  simpler_grants_gov: {
    sourceName: "simpler_grants_gov",
    baseUrl: "https://api.simpler.grants.gov",
    retrievalMethod: "official_api",
    apiDocumentationUrl: "https://wiki.simpler.grants.gov/product/api/search-opportunities",
    rateLimitPerMinute: 60,
    requestDelayMs: 1_100,
    robotsTxtUrl: "https://api.simpler.grants.gov/robots.txt",
    robotsAssessment:
      "The API host disallows general crawling but explicitly allows /docs. Retrieval uses the documented API with an issued API key, not HTML crawling.",
    complianceBasis:
      "The official developer portal authorizes programmatic catalog search and publishes limits of 60 requests/minute and 10,000/day per key.",
    lastComplianceReviewDate: "2026-08-05",
    enabled: true,
  },
  california_grants_portal: {
    sourceName: "california_grants_portal",
    baseUrl: "https://data.ca.gov",
    retrievalMethod: "official_dataset",
    apiDocumentationUrl: "https://lab.data.ca.gov/dataset/california-grants-portal",
    rateLimitPerMinute: 6,
    requestDelayMs: 10_000,
    robotsTxtUrl: "https://data.ca.gov/robots.txt",
    robotsAssessment:
      "The official dataset advertises an API, but robots.txt currently disallows /api/. Disabled pending written clarification from the California State Library.",
    complianceBasis:
      "Official California State Library public-domain dataset; disabled because the current robots policy conflicts with automated API retrieval.",
    lastComplianceReviewDate: "2026-08-05",
    enabled: false,
  },
};

export const INGESTION_THRESHOLDS = {
  minimumAcceptedRecords: 25,
  minimumNonprofitEligibilityPercent: 95,
  maximumRowCountChangePercent: 500,
} as const;
