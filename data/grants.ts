import type { Grant } from "@/types";

export interface GrantMatch extends Grant {
  matchScore: number;
  matchLabel: string;
  amountRange: string;
  deadlineLabel: string;
  daysLeft: number;
  location: string;
  organization: string;
  tags: string[];
  aiInsight?: string;
  saved?: boolean;
  warning?: string;
}

export const featuredGrant: GrantMatch = {
  id: "global-stem-innovation-fund",
  title: "2024 Global STEM Innovation Fund",
  organization: "Lumina Foundation",
  funder: "Lumina Foundation",
  description:
    "The Lumina Foundation is offering grants to nonprofits focused on closing the digital literacy gap in under-resourced urban secondary schools.",
  status: "open",
  category: "STEM & Technology",
  region: "National",
  amount: 250000,
  deadline: "2024-10-15",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
  applicationUrl:
    "https://www.luminafoundation.org/grants/apply/global-stem-innovation-fund",
  matchScore: 91,
  matchLabel: "High Compatibility",
  amountRange: "$50,000 – $250,000",
  deadlineLabel: "Oct 15 (12 days left)",
  daysLeft: 12,
  location: "Global (Urban focus)",
  tags: ["Education", "STEM", "Urban"],
};

export const grantMatches: GrantMatch[] = [
  {
    id: "rockefeller-community-resilience",
    title: "Rockefeller Community Resilience Fund",
    organization: "Rockefeller Foundation",
    funder: "Rockefeller Foundation",
    description:
      "Funding for innovative urban agriculture projects that integrate community education and sustainable irrigation practices within metropolitan areas.",
    status: "open",
    category: "Community Development",
    region: "National",
    deadline: "2023-10-15",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
    applicationUrl:
      "https://www.rockefellerfoundation.org/grants/apply/rockefeller-community-resilience",
    matchScore: 94,
    matchLabel: "High Compatibility",
    amountRange: "$150,000 – $500,000",
    deadlineLabel: "Oct 15 (2 days left)",
    daysLeft: 2,
    location: "National (USA)",
    tags: ["Urban Farming", "Youth Education", "Sustainability"],
    aiInsight:
      "Highly aligned with your 2022 youth impact report. The foundation has recently shifted focus towards Metropolitan Greening.",
  },
  {
    id: "green-foundation-innovation",
    title: "Green Foundation Annual Innovation Grant",
    organization: "Green Foundation",
    funder: "Green Foundation",
    description:
      "Broad environmental grant focusing on carbon sequestration and community-led conservation efforts across the Pacific Northwest.",
    status: "open",
    category: "Environment",
    region: "Western US",
    deadline: "2023-11-30",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
    applicationUrl:
      "https://green-foundation.org/grants/apply/green-foundation-innovation",
    matchScore: 78,
    matchLabel: "Moderate Match",
    amountRange: "Up to $75,000",
    deadlineLabel: "Nov 30, 2023",
    daysLeft: 30,
    location: "Pacific Northwest",
    tags: ["Environment", "Conservation"],
    saved: true,
    warning: "Requires 501(c)(3) for 3+ years",
  },
  {
    id: "urban-youth-tech",
    title: "Urban Youth Tech Access Initiative",
    organization: "TechForward Alliance",
    funder: "TechForward Alliance",
    description:
      "Supporting digital literacy programs for underserved youth in metropolitan school districts.",
    status: "open",
    category: "STEM & Technology",
    region: "National",
    deadline: "2024-01-15",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
    applicationUrl:
      "https://techforward-alliance.org/grants/apply/urban-youth-tech",
    matchScore: 86,
    matchLabel: "Strong Match",
    amountRange: "$25,000 – $100,000",
    deadlineLabel: "Jan 15, 2024",
    daysLeft: 18,
    location: "Urban USA",
    tags: ["Education", "Youth", "Technology"],
  },
  {
    id: "community-food-security",
    title: "Community Food Security Partnership",
    organization: "National Food Alliance",
    funder: "National Food Alliance",
    description:
      "Grants for organizations addressing food insecurity through sustainable urban agriculture and education.",
    status: "open",
    category: "Food Security",
    region: "National",
    deadline: "2024-02-28",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-06-01T00:00:00Z",
    applicationUrl:
      "https://national-food-alliance.org/grants/apply/community-food-security",
    matchScore: 82,
    matchLabel: "Strong Match",
    amountRange: "$40,000 – $120,000",
    deadlineLabel: "Feb 28, 2024",
    daysLeft: 45,
    location: "National (USA)",
    tags: ["Food Equity", "Sustainability"],
  },
];

export const missionKeywords = [
  "Urban Farming",
  "Youth Education",
  "Sustainability",
  "Food Equity",
  "Local Economy",
];

export const eligibilityItems = [
  {
    met: true,
    title: "501(c)(3) Status",
    description: "Must have active non-profit status for at least 3 years.",
  },
  {
    met: true,
    title: "Operating Budget",
    description: "Annual operating budget must exceed $500,000.",
  },
  {
    met: false,
    title: "Religious Affiliation",
    description:
      "Proposals for direct religious instruction or proselytizing are ineligible.",
  },
];

export const pastWinners = [
  { name: "Urban Tech Collective", amount: "$180,000 awarded", icon: "school" },
  { name: "FutureCode Initiative", amount: "$125,000 awarded", icon: "memory" },
];
