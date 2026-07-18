import { describe, expect, it } from "vitest";
import {
  buildInitialApplicationSections,
  proposalTemplate,
} from "@/lib/applications/proposal-template";
import { makeGrant, organization } from "../grants/fixtures";

describe("proposal template", () => {
  it("defines ordered, unique sections", () => {
    expect(new Set(proposalTemplate.map((section) => section.id)).size).toBe(proposalTemplate.length);
    expect(proposalTemplate.map((section) => section.order)).toEqual(
      [...proposalTemplate].map((section) => section.order).sort((a, b) => a - b),
    );
  });

  it("populates deterministic application facts", () => {
    const sections = buildInitialApplicationSections(
      organization,
      {
        grantId: "grant-1",
        projectName: "Tech Access",
        amountRequested: 50000,
        projectStartDate: "2026-09-01",
        projectEndDate: "2027-08-31",
        projectSummary: "A program summary",
        problemStatement: "A documented need",
        targetBeneficiaries: "Teens",
        peopleServed: 100,
        plannedActivities: "Weekly instruction",
        measurableOutcomes: "Improved skills",
        evaluationApproach: "Pre and post assessments",
        projectBudgetSummary: "Personnel and equipment",
        sustainabilityPlan: "",
        partnerships: "",
        staffResponsible: "",
        organizationNotes: "",
        selectedDocumentIds: [],
        grantQuestionResponses: {},
      },
      makeGrant({ requiredDocuments: ["IRS determination letter"] }),
    );
    expect(sections.find((section) => section.section_key === "cover_information")?.content)
      .toContain("Amount requested: $50,000");
    expect(sections.find((section) => section.section_key === "attachments")?.content)
      .toContain("IRS determination letter");
  });
});
