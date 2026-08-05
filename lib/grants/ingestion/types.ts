export const GRANT_STATUSES = [
  "open",
  "upcoming",
  "rolling",
  "closed",
  "expired",
  "archived",
  "unverified",
] as const;

export const VERIFICATION_STATUSES = [
  "verified",
  "partially_verified",
  "unverified",
  "failed",
] as const;

export const REJECTION_REASONS = [
  "NONPROFIT_NOT_ELIGIBLE",
  "EXPIRED",
  "BROKEN_SOURCE_URL",
  "BROKEN_APPLICATION_URL",
  "DUPLICATE",
  "INSUFFICIENT_VERIFICATION",
  "SCHOLARSHIP",
  "LOAN",
  "CONTRACT",
  "BUSINESS_ONLY",
  "INDIVIDUAL_ONLY",
  "UNAUTHORIZED_SOURCE",
  "INVALID_RECORD",
] as const;

export type GrantStatus = (typeof GRANT_STATUSES)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
export type RejectionReason = (typeof REJECTION_REASONS)[number];

export type RawGrantRecord = Record<string, unknown>;

export interface NormalizedGrantRecord {
  id: string;
  source: string;
  sourceRecordId: string;
  sourceUrl: string;
  sourceApplicationUrl: string;
  grantName: string;
  funderName: string;
  funderType: string | null;
  description: string;
  summary: string | null;
  eligibilitySummary: string;
  eligibleOrganizationTypes: string[];
  nonprofitEligible: boolean;
  requires501c3: boolean | null;
  fiscalSponsorAllowed: boolean | null;
  eligibleStates: string[];
  eligibleCounties: string[];
  eligibleCountries: string[];
  geographicScope: string | null;
  focusAreas: string[];
  targetPopulations: string[];
  programTypes: string[];
  minimumAward: number | null;
  maximumAward: number | null;
  estimatedAward: number | null;
  totalFundingAvailable: number | null;
  currency: string;
  deadline: string | null;
  deadlineType: "fixed" | "rolling" | "multiple_cycles" | "unknown";
  opensAt: string | null;
  letterOfIntentDeadline: string | null;
  rolling: boolean;
  recurring: boolean;
  frequency: string | null;
  matchingFundsRequired: boolean | null;
  applicationRequirements: string[];
  requiredDocuments: string[];
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: GrantStatus;
  verificationStatus: VerificationStatus;
  verificationMethod: string;
  verifiedAt: string;
  lastCheckedAt: string;
  firstSeenAt: string;
  publishedAt: string | null;
  contentHash: string;
  rawSourceData: RawGrantRecord;
  category: string;
  region: string;
}

export interface SourceCompliance {
  sourceName: string;
  baseUrl: string;
  retrievalMethod: "official_api" | "official_dataset";
  apiDocumentationUrl: string;
  rateLimitPerMinute: number;
  requestDelayMs: number;
  robotsTxtUrl: string;
  robotsAssessment: string;
  complianceBasis: string;
  lastComplianceReviewDate: string;
  enabled: boolean;
}

export interface GrantSourceAdapter {
  sourceName: string;
  compliance: SourceCompliance;
  fetchRecords(options?: { limit?: number }): Promise<RawGrantRecord[]>;
  normalize(record: RawGrantRecord, now?: Date): Promise<NormalizedGrantRecord | null>;
}

export interface RejectedGrantRecord {
  source: string;
  sourceRecordId: string | null;
  sourceUrl: string | null;
  grantName: string | null;
  funderName: string | null;
  reason: RejectionReason;
  detail: string;
  recommendedAction: string;
  rawSourceData: RawGrantRecord;
}

export interface DuplicateCandidate {
  recordId: string;
  duplicateOf: string;
  method: "source_record_id" | "source_url" | "application_url" | "fingerprint";
  confidence: "exact" | "review";
}

export interface ValidationGate {
  name: string;
  passed: boolean;
  actual: number | string;
  expected: string;
  fatal: boolean;
}

export interface IngestionResult {
  runId: string;
  startedAt: string;
  completedAt: string;
  sourcesAttempted: string[];
  fetchedBySource: Record<string, number>;
  fetched: number;
  normalized: number;
  accepted: NormalizedGrantRecord[];
  rejected: RejectedGrantRecord[];
  duplicateCandidates: DuplicateCandidate[];
  deduplicated: number;
  gates: ValidationGate[];
  validationPassed: boolean;
}

export interface ExistingCatalogSnapshot {
  grants: number;
  activeGrants: number;
  verifiedGrants: number;
  savedGrants: number;
  applications: number;
  generatedProposals: number;
  grantMatchSnapshots: number;
  applicationSections: number;
  aiGenerationRecords: number;
  checksum: string;
}
