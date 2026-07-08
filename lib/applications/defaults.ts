import type { Json } from "@/types/database";

export interface DraftSection {
  title: string;
  body: string;
}

export const defaultDraftSections: DraftSection[] = [
  {
    title: "Executive summary",
    body: "Describe the organization, the requested support, and the community need this application will address.",
  },
  {
    title: "Statement of need",
    body: "Explain the problem, who is affected, and why this funding opportunity is a strong fit.",
  },
  {
    title: "Program design",
    body: "Outline the activities, timeline, staffing, partnerships, and implementation approach.",
  },
  {
    title: "Outcomes and evaluation",
    body: "List the measurable outcomes and how progress will be tracked during the grant period.",
  },
  {
    title: "Budget narrative",
    body: "Summarize how requested funds will be used and why those expenses are necessary.",
  },
];

export function buildDefaultDraftSections(grantTitle?: string | null): DraftSection[] {
  if (!grantTitle) {
    return defaultDraftSections;
  }

  return defaultDraftSections.map((section) =>
    section.title === "Executive summary"
      ? {
          ...section,
          body: `Draft an executive summary for ${grantTitle}, including the organization mission, the proposed work, and the funding request.`,
        }
      : section,
  );
}

export function normalizeDraftSections(value: Json | null | undefined): DraftSection[] {
  if (!Array.isArray(value)) {
    return defaultDraftSections;
  }

  const sections = value
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }

      const title = entry.title;
      const body = entry.body;

      if (typeof title !== "string" || typeof body !== "string") {
        return null;
      }

      return { title, body };
    })
    .filter((section): section is DraftSection => section !== null);

  return sections.length > 0 ? sections : defaultDraftSections;
}
