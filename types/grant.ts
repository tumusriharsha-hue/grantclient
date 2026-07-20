export const GRANT_CATEGORIES = [
  "Education",
  "Youth Programs",
  "Sports & Recreation",
  "STEM & Technology",
  "Community Development",
  "Arts & Culture",
  "Environment",
  "Healthcare",
  "Food Security",
  "Animal Welfare",
  "Capacity Building",
] as const;

export type GrantCategory = (typeof GRANT_CATEGORIES)[number];

export type GrantStatus =
  | "draft" | "open" | "upcoming" | "rolling" | "closed" | "expired"
  | "paused" | "invitation_only" | "no_unsolicited_applications"
  | "recurring_unconfirmed" | "archived" | "awarded";

export type GrantRegion =
  | "National"
  | "Texas"
  | "South Central US"
  | "Southwest US"
  | "Southeast US"
  | "Midwest US"
  | "Northeast US"
  | "Western US";

export interface Grant {
  id: string;
  title: string;
  description: string;
  funder: string;
  category: GrantCategory;
  region: GrantRegion;
  status: GrantStatus;
  amount?: number;
  awardMin?: number;
  awardMax?: number;
  deadline?: string;
  applicationOpenDate?: string;
  deadlineType?: "fixed" | "rolling" | "multiple_cycles" | "unknown";
  deadlineTimezone?: string;
  rollingDeadline?: boolean;
  eligibilitySummary?: string;
  eligibleOrganizationTypes?: string[];
  requiredNonprofitStatus?: string;
  eligibleLocations?: string[];
  geographicScope?: string;
  focusAreas?: string[];
  populationsServed?: string[];
  minimumAnnualBudget?: number;
  maximumAnnualBudget?: number;
  minimumRequestAmount?: number;
  maximumRequestAmount?: number;
  requirements?: string[];
  requiredDocuments?: string[];
  applicationQuestions?: Array<{ id: string; question: string; required?: boolean }>;
  sourceUrl?: string;
  officialUrl?: string;
  verifiedAt?: string;
  nextReviewAt?: string;
  confidenceLevel?: "high" | "medium" | "low";
  invitationOnly?: boolean;
  unsolicitedApplicationsAccepted?: boolean;
  restrictions?: string[];
  typicalAward?: number;
  verificationNotes?: string;
  /** External funder application portal URL */
  applicationUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrantListParams {
  status?: GrantStatus;
  category?: GrantCategory;
  region?: GrantRegion;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
