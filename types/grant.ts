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

export type GrantStatus = "draft" | "open" | "closed" | "awarded";

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
  deadline?: string;
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
