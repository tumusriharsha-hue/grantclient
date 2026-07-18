import { describe, expect, it } from "vitest";
import {
  buildSectionGenerationContext,
  ensureNeedsInputMarkers,
} from "@/lib/ai/section-context";
import { proposalTemplate } from "@/lib/applications/proposal-template";

describe("section generation context", () => {
  const executiveSummary = proposalTemplate.find(
    (section) => section.id === "executive_summary",
  )!;

  it("sends only fields declared by the active section", () => {
    const context = buildSectionGenerationContext(executiveSummary, {
      organization: { mission: "Education access", budget: 100000, secret: "omit" },
      application: {
        projectSummary: "After-school tutoring",
        amountRequested: 25000,
        measurableOutcomes: "Improve reading proficiency",
        organizationNotes: "omit",
      },
      grant: { description: "omit" },
    });
    expect(Object.keys(context.fields).sort()).toEqual(
      [...executiveSummary.requiredSources, ...executiveSummary.optionalSources].sort(),
    );
    expect(JSON.stringify(context.fields)).not.toContain("secret");
    expect(JSON.stringify(context.fields)).not.toContain("organizationNotes");
  });

  it("adds NEEDS INPUT markers for missing required facts", () => {
    const content = ensureNeedsInputMarkers("A factual opening.", ["application.amountRequested"]);
    expect(content).toContain("[NEEDS INPUT: application.amountRequested]");
  });
});
