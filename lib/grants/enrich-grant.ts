import type { Grant, GrantCategory } from "@/types/grant";
import type {
  MissionCategory,
  PopulationServed,
  PreferredGrantType,
} from "@/types/organization";

export interface EnrichedGrant extends Grant {
  requires501c3: boolean;
  isGovernment: boolean;
  grantTypes: PreferredGrantType[];
  populations: PopulationServed[];
}

const GOVERNMENT_FUNDER_HINTS = [
  "department of",
  "administration",
  "national science foundation",
  "national institutes of health",
  "usda",
  "hud",
  "epa",
  "cdc",
  "samhsa",
  "federal",
  "government",
  "state of",
  "county of",
  "city of",
];

const GRANT_TYPE_KEYWORDS: Record<PreferredGrantType, string[]> = {
  "General Operating Support": ["operating", "general support", "general operating", "unrestricted"],
  "Program Funding": ["program", "initiative", "project", "services"],
  "Equipment Purchases": ["equipment", "technology", "devices", "supplies"],
  "Capital Improvements": ["capital", "facility", "building", "infrastructure", "renovation"],
  Scholarships: ["scholarship", "tuition", "fellowship", "student aid"],
  Research: ["research", "study", "evaluation", "pilot study"],
  "Community Events": ["event", "festival", "gathering", "community day"],
};

const POPULATION_KEYWORDS: Record<PopulationServed, string[]> = {
  "Children (0–12)": ["children", "elementary", "kids", "early childhood"],
  "Teens (13–18)": ["teen", "adolescent", "high school", "youth"],
  "College Students": ["college", "university", "campus", "postsecondary"],
  "Young Adults": ["young adult", "early career", "18-24"],
  Seniors: ["senior", "elder", "aging", "older adult"],
  Veterans: ["veteran", "military", "service member"],
  Women: ["women", "girls", "female"],
  "Low-Income Communities": ["low-income", "underserved", "poverty", "economically disadvantaged"],
  "Disabled Individuals": ["disability", "accessible", "special needs", "inclusive"],
  "Rural Communities": ["rural", "frontier", "remote"],
  "Urban Communities": ["urban", "metropolitan", "city"],
  "Minority Communities": ["minority", "bipoc", "immigrant", "refugee", "equity"],
};

const MISSION_TO_GRANT_CATEGORY: Record<MissionCategory, GrantCategory[]> = {
  Education: ["Education", "STEM & Technology"],
  "Youth Development": ["Youth Programs", "Education"],
  "Sports & Recreation": ["Sports & Recreation", "Youth Programs"],
  "Arts & Culture": ["Arts & Culture"],
  Healthcare: ["Healthcare"],
  "Mental Health": ["Healthcare", "Youth Programs"],
  "Disabilities & Accessibility": ["Healthcare", "Youth Programs"],
  Environment: ["Environment"],
  "Food Security": ["Food Security"],
  "Housing & Homelessness": ["Community Development"],
  "Women's Empowerment": ["Community Development", "Youth Programs"],
  "Senior Services": ["Healthcare", "Community Development"],
  "Workforce Development": ["Community Development", "Education", "Capacity Building"],
  "Technology Access": ["STEM & Technology", "Education"],
  "Community Development": ["Community Development", "Capacity Building"],
  "Animal Welfare": ["Animal Welfare"],
};

function normalize(text: string): string {
  return text.toLowerCase();
}

function getHaystack(grant: Grant): string {
  return normalize(
    [grant.title, grant.description, grant.funder, grant.category].join(" "),
  );
}

function inferGrantTypes(grant: Grant): PreferredGrantType[] {
  const haystack = getHaystack(grant);
  const matched = (Object.keys(GRANT_TYPE_KEYWORDS) as PreferredGrantType[]).filter(
    (type) => GRANT_TYPE_KEYWORDS[type].some((term) => haystack.includes(term)),
  );

  if (matched.length > 0) return matched;
  return ["Program Funding"];
}

function inferPopulations(grant: Grant): PopulationServed[] {
  const haystack = getHaystack(grant);
  const matched = (Object.keys(POPULATION_KEYWORDS) as PopulationServed[]).filter(
    (population) =>
      POPULATION_KEYWORDS[population].some((term) => haystack.includes(term)),
  );

  if (matched.length > 0) return matched;

  if (grant.category === "Youth Programs") {
    return ["Teens (13–18)", "Children (0–12)"];
  }

  return ["Low-Income Communities"];
}

function inferRequires501c3(grant: Grant): boolean {
  const haystack = getHaystack(grant);
  if (haystack.includes("501(c)(3)") || haystack.includes("nonprofit")) {
    return true;
  }

  if (grant.funder.toLowerCase().includes("foundation")) {
    return true;
  }

  return grant.amount !== undefined && grant.amount >= 25000;
}

function inferIsGovernment(grant: Grant): boolean {
  const haystack = getHaystack(grant);
  return GOVERNMENT_FUNDER_HINTS.some((hint) => haystack.includes(hint));
}

export function enrichGrant(grant: Grant): EnrichedGrant {
  return {
    ...grant,
    requires501c3: inferRequires501c3(grant),
    isGovernment: inferIsGovernment(grant),
    grantTypes: inferGrantTypes(grant),
    populations: inferPopulations(grant),
  };
}

export function enrichGrants(grants: Grant[]): EnrichedGrant[] {
  return grants.map(enrichGrant);
}

export function getGrantCategoriesForMission(category: MissionCategory): GrantCategory[] {
  return MISSION_TO_GRANT_CATEGORY[category] ?? [];
}

export { MISSION_TO_GRANT_CATEGORY, GRANT_TYPE_KEYWORDS, POPULATION_KEYWORDS };
