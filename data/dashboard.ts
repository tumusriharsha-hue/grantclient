export const dashboardStats = {
  fundingPotential: "$250k",
  activeApplications: 3,
  deadlinesThisWeek: 2,
};

export const recommendedGrants = [
  {
    id: "rockefeller-community-resilience",
    title: "Rockefeller Community Resilience Fund",
    organization: "Rockefeller Foundation",
    amountRange: "$150,000 – $500,000",
    daysLeft: 2,
    deadlineLabel: "Oct 15 (12 days)",
    matchScore: 94,
    applicationUrl:
      "https://www.rockefellerfoundation.org/grants/apply/rockefeller-community-resilience",
    insight:
      "Highly aligned with your 2022 youth impact report. Focus on metropolitan green spaces matches your mission.",
  },
  {
    id: "global-stem-innovation-fund",
    title: "2024 Global STEM Innovation Fund",
    organization: "Lumina Foundation",
    amountRange: "$50,000 – $250,000",
    daysLeft: 12,
    deadlineLabel: "Oct 15 (12 days)",
    matchScore: 91,
    applicationUrl:
      "https://www.luminafoundation.org/grants/apply/global-stem-innovation-fund",
    insight: "Matches your digital literacy focus in urban schools.",
  },
  {
    id: "urban-youth-tech",
    title: "Urban Youth Tech Access Initiative",
    organization: "TechForward Alliance",
    amountRange: "$25,000 – $100,000",
    daysLeft: 18,
    matchScore: 86,
    applicationUrl:
      "https://techforward-alliance.org/grants/apply/urban-youth-tech",
    insight: "Prioritizes organizations serving 500+ teens annually.",
  },
];

export const applicationStatus = {
  drafting: {
    count: 2,
    items: [
      {
        id: "1",
        title: "Community Impact Fund LOI",
        href: "/applications/1",
        grantName: "Community Impact Fund",
        funder: "Community Impact Fund",
        lastUpdated: "2024-10-05",
        progress: 60,
        summary:
          "Letter of inquiry focused on expanding neighborhood food access and after-school family support services.",
      },
      {
        id: "2",
        title: "STEM Innovation Proposal",
        href: "/applications/2",
        grantName: "STEM Innovation Proposal",
        funder: "Lumina Foundation",
        lastUpdated: "2024-10-05",
        progress: 45,
        summary:
          "Draft proposal for hands-on STEM programming, mentor-led workshops, and classroom technology access.",
      },
    ],
  },
  submitted: {
    count: 1,
    items: [
      {
        id: "3",
        title: "Green Foundation Grant",
        submissionDate: "2024-10-01",
      },
    ],
  },
  outcomes: {
    count: 2,
    items: [
      {
        id: "4",
        title: "Youth Literacy Fund",
        outcome: "Approved",
        amount: "$45,000",
        submissionDate: "2024-09-03",
        decisionDate: "2024-09-24",
      },
      {
        id: "5",
        title: "Neighborhood Arts Access Grant",
        outcome: "Rejected",
        submissionDate: "2024-08-28",
        decisionDate: "2024-09-18",
      },
    ],
  },
};

export const upcomingDeadlines = [
  { date: "Oct 15", daysLeft: 2, grant: "Rockefeller Community Resilience Fund" },
  { date: "Oct 17", daysLeft: 4, grant: "Ford Foundation Education Grant" },
  { date: "Oct 22", daysLeft: 9, grant: "Community Food Security Partnership" },
];
