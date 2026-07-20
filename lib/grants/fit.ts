const POPULATION_ALIASES: Record<string, string> = {
  children: "youth", "children 0 12": "youth", teenagers: "youth", teens: "youth", "teens 13 18": "youth", youth: "youth",
  students: "students", "college students": "students", "young adults": "young adults", seniors: "older adults", "older adults": "older adults", elderly: "older adults",
  veterans: "veterans", "low income communities": "low income", "economically disadvantaged": "low income", "disabled individuals": "disability", "people with disabilities": "disability", disability: "disability",
  "rural communities": "rural", "historically underserved communities": "underserved", "minority communities": "underserved", women: "women", families: "families", educators: "educators", athletes: "athletes", "immigrants or refugees": "immigrants refugees", "general community": "general",
};

function normalizePopulation(value: string): string {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return POPULATION_ALIASES[normalized] ?? normalized;
}

function uniquePopulations(values: string[]): string[] {
  return [...new Set(values.map(normalizePopulation).filter(Boolean))];
}

export type PopulationFitStatus = "strong_match" | "partial_match" | "general" | "mismatch" | "unknown";
export interface PopulationFitResult {
  status: PopulationFitStatus;
  score: number;
  matchedPopulations: string[];
  unmatchedOrganizationPopulations: string[];
  explanation: string;
}

export function calculatePopulationFit(organizationPopulations: string[], grantPopulations: string[]): PopulationFitResult {
  const organization = uniquePopulations(organizationPopulations);
  const grant = uniquePopulations(grantPopulations);
  if (organization.length === 0) return { status: "unknown", score: 0, matchedPopulations: [], unmatchedOrganizationPopulations: [], explanation: "Add the populations your organization serves to improve this score." };
  if (grant.length === 0 || grant.includes("general")) return { status: "general", score: 75, matchedPopulations: [], unmatchedOrganizationPopulations: organization, explanation: "This grant does not list a restricted target population and may support a broad community." };
  const matched = organization.filter((population) => grant.includes(population));
  const unmatched = organization.filter((population) => !matched.includes(population));
  if (matched.length === 0) return { status: "mismatch", score: 0, matchedPopulations: [], unmatchedOrganizationPopulations: unmatched, explanation: "The grant's stated target populations do not overlap with the populations your organization serves." };
  const strong = unmatched.length === 0;
  const ratio = matched.length / organization.length;
  return { status: strong ? "strong_match" : "partial_match", score: strong ? 100 : Math.round(60 + ratio * 30), matchedPopulations: matched, unmatchedOrganizationPopulations: unmatched, explanation: strong ? `Your organization serves ${matched.join(", ")}; this grant directly targets those populations.` : `Your organization serves ${unmatched.join(", ")} in addition to ${matched.join(", ")}; the grant overlaps partially.` };
}

export type FundingFitStatus = "within_range" | "partial_overlap" | "below_range" | "above_range" | "unknown";
export interface FundingRange { min: number | null; max: number | null }
export interface FundingFitResult { status: FundingFitStatus; score: number; explanation: string; overlapMinimum: number | null; overlapMaximum: number | null }

function validRange(range: FundingRange): boolean {
  return (range.min === null || Number.isFinite(range.min)) && (range.max === null || Number.isFinite(range.max)) && (range.min === null || range.min >= 0) && (range.max === null || range.max >= 0) && (range.min === null || range.max === null || range.max >= range.min);
}

function formatRange(range: FundingRange): string {
  const format = (value: number) => `$${value.toLocaleString("en-US")}`;
  if (range.min !== null && range.max !== null) return `${format(range.min)}–${format(range.max)}`;
  if (range.min !== null) return `${format(range.min)}+`;
  if (range.max !== null) return `up to ${format(range.max)}`;
  return "an unspecified range";
}

export function calculateFundingFit(organizationRange: FundingRange, grantRange: FundingRange): FundingFitResult {
  if (!validRange(organizationRange) || !validRange(grantRange) || (organizationRange.min === null && organizationRange.max === null) || (grantRange.min === null && grantRange.max === null)) return { status: "unknown", score: 0, explanation: "Add a preferred funding range and verify the grant award range to improve this score.", overlapMinimum: null, overlapMaximum: null };
  const organizationMin = organizationRange.min ?? 0;
  const organizationMax = organizationRange.max ?? Number.POSITIVE_INFINITY;
  const grantMin = grantRange.min ?? 0;
  const grantMax = grantRange.max ?? Number.POSITIVE_INFINITY;
  const overlapMinimum = Math.max(organizationMin, grantMin);
  const overlapMaximum = Math.min(organizationMax, grantMax);
  if (overlapMinimum > overlapMaximum) {
    const status = grantMax < organizationMin ? "below_range" : "above_range";
    return { status, score: 15, explanation: status === "below_range" ? `This grant awards ${formatRange(grantRange)}, below your requested range of ${formatRange(organizationRange)}.` : `This grant awards ${formatRange(grantRange)}, above your requested range of ${formatRange(organizationRange)}.`, overlapMinimum: null, overlapMaximum: null };
  }
  const fullyContains = grantMin >= organizationMin && grantMax <= organizationMax;
  const requestFitsGrant = organizationMin >= grantMin && organizationMax <= grantMax;
  const max = Number.isFinite(overlapMaximum) ? overlapMaximum : organizationRange.max;
  if (fullyContains || requestFitsGrant) return { status: "within_range", score: 100, explanation: `Your organization is seeking ${formatRange(organizationRange)}. This grant awards ${formatRange(grantRange)}, which is within your funding range.`, overlapMinimum, overlapMaximum: max };
  const union = Math.max(organizationMax, grantMax) - Math.min(organizationMin, grantMin);
  const ratio = union > 0 && Number.isFinite(union) ? (overlapMaximum - overlapMinimum) / union : 0.5;
  return { status: "partial_overlap", score: Math.round(65 + Math.min(1, ratio) * 20), explanation: `Your range is ${formatRange(organizationRange)} and the grant range is ${formatRange(grantRange)}. The overlap is ${formatRange({ min: overlapMinimum, max })}.`, overlapMinimum, overlapMaximum: max };
}
