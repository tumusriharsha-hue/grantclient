export const ORGANIZATION_TYPES = [
  "501(c)(3) Nonprofit",
  "School",
  "University",
  "Religious Organization",
  "Community Group",
  "Social Enterprise",
  "Other",
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const MISSION_CATEGORIES = [
  "Education",
  "Youth Development",
  "Sports & Recreation",
  "Arts & Culture",
  "Healthcare",
  "Mental Health",
  "Disabilities & Accessibility",
  "Environment",
  "Food Security",
  "Housing & Homelessness",
  "Women's Empowerment",
  "Senior Services",
  "Workforce Development",
  "Technology Access",
  "Community Development",
  "Animal Welfare",
] as const;

export type MissionCategory = (typeof MISSION_CATEGORIES)[number];

export const POPULATIONS_SERVED = [
  "Children (0–12)",
  "Teens (13–18)",
  "College Students",
  "Young Adults",
  "Seniors",
  "Veterans",
  "Women",
  "Low-Income Communities",
  "Disabled Individuals",
  "Rural Communities",
  "Urban Communities",
  "Minority Communities",
] as const;

export type PopulationServed = (typeof POPULATIONS_SERVED)[number];

export const ANNUAL_BUDGET_RANGES = [
  "Under $50,000",
  "$50,000–$250,000",
  "$250,000–$1M",
  "Over $1M",
] as const;

export type AnnualBudgetRange = (typeof ANNUAL_BUDGET_RANGES)[number];

export const ORGANIZATION_AGE_RANGES = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5+ years",
] as const;

export type OrganizationAgeRange = (typeof ORGANIZATION_AGE_RANGES)[number];

export const PREFERRED_GRANT_AMOUNTS = [
  "Under $5,000",
  "$5,000–$25,000",
  "$25,000–$100,000",
  "$100,000+",
] as const;

export type PreferredGrantAmount = (typeof PREFERRED_GRANT_AMOUNTS)[number];

export const PREFERRED_GRANT_TYPES = [
  "General Operating Support",
  "Program Funding",
  "Equipment Purchases",
  "Capital Improvements",
  "Scholarships",
  "Research",
  "Community Events",
] as const;

export type PreferredGrantType = (typeof PREFERRED_GRANT_TYPES)[number];

/** @deprecated Use MISSION_CATEGORIES */
export const FOCUS_AREAS = MISSION_CATEGORIES;
/** @deprecated Use MissionCategory */
export type FocusArea = MissionCategory;

export const ONBOARDING_STEPS = [
  { id: 1, title: "Organization Basics", subtitle: "Tell us about your organization" },
  { id: 2, title: "Mission Categories", subtitle: "What causes do you support?" },
  { id: 3, title: "Populations Served", subtitle: "Who do you serve?" },
  { id: 4, title: "Location", subtitle: "Where do you operate?" },
  { id: 5, title: "Organization Details", subtitle: "Help us find grants that fit your organization" },
  { id: 6, title: "Funding Preferences", subtitle: "What kinds of grants are you looking for?" },
] as const;

export const TOTAL_ONBOARDING_STEPS = ONBOARDING_STEPS.length;
