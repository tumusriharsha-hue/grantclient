import type { ApplicationSetupInput } from "@/lib/validations/application";
import type { Organization } from "@/types/database";
import type { Grant } from "@/types/grant";

export const PROPOSAL_TEMPLATE_VERSION = "v1";

export interface ProposalTemplateSection {
  id: string;
  title: string;
  description: string;
  requiredSources: string[];
  optionalSources: string[];
  maxWords: number;
  aiEnabled: boolean;
  deterministic: boolean;
  order: number;
}

export const proposalTemplate: ProposalTemplateSection[] = [
  { id: "cover_information", title: "Cover Information", description: "Core application facts.", requiredSources: ["organization.organization_name", "application.projectName", "application.amountRequested"], optionalSources: ["organization.website"], maxWords: 100, aiEnabled: false, deterministic: true, order: 1 },
  { id: "executive_summary", title: "Executive Summary", description: "A concise overview of the request.", requiredSources: ["organization.mission", "application.projectSummary", "application.amountRequested"], optionalSources: ["application.measurableOutcomes"], maxWords: 250, aiEnabled: true, deterministic: false, order: 2 },
  { id: "organization_background", title: "Organization Background", description: "Mission, history, programs, and capacity.", requiredSources: ["organization.organization_name", "organization.mission"], optionalSources: ["organization.year_founded", "organization.programs", "organization.impact_goals"], maxWords: 250, aiEnabled: true, deterministic: false, order: 3 },
  { id: "statement_of_need", title: "Statement of Need", description: "The specific problem the project addresses.", requiredSources: ["application.problemStatement"], optionalSources: ["application.targetBeneficiaries", "application.peopleServed"], maxWords: 400, aiEnabled: true, deterministic: false, order: 4 },
  { id: "project_description", title: "Project Description", description: "Project approach, dates, and activities.", requiredSources: ["application.projectSummary", "application.plannedActivities"], optionalSources: ["application.partnerships", "application.staffResponsible"], maxWords: 500, aiEnabled: true, deterministic: false, order: 5 },
  { id: "goals_objectives", title: "Goals and Measurable Objectives", description: "Expected outcomes and measures.", requiredSources: ["application.measurableOutcomes"], optionalSources: ["organization.impact_goals"], maxWords: 300, aiEnabled: true, deterministic: false, order: 6 },
  { id: "target_population", title: "Target Population", description: "Who the project will serve.", requiredSources: ["application.targetBeneficiaries"], optionalSources: ["application.peopleServed", "organization.populations_served"], maxWords: 250, aiEnabled: true, deterministic: false, order: 7 },
  { id: "activities_timeline", title: "Activities and Timeline", description: "Planned work and project dates.", requiredSources: ["application.plannedActivities", "application.projectStartDate", "application.projectEndDate"], optionalSources: [], maxWords: 350, aiEnabled: true, deterministic: false, order: 8 },
  { id: "evaluation_plan", title: "Evaluation Plan", description: "How progress and outcomes will be measured.", requiredSources: ["application.evaluationApproach"], optionalSources: ["application.measurableOutcomes"], maxWords: 300, aiEnabled: true, deterministic: false, order: 9 },
  { id: "budget_narrative", title: "Project Budget Narrative", description: "How grant funds will be used.", requiredSources: ["application.projectBudgetSummary", "application.amountRequested"], optionalSources: [], maxWords: 300, aiEnabled: true, deterministic: false, order: 10 },
  { id: "sustainability", title: "Sustainability", description: "How the work continues after the grant.", requiredSources: ["application.sustainabilityPlan"], optionalSources: ["application.partnerships"], maxWords: 250, aiEnabled: true, deterministic: false, order: 11 },
  { id: "organizational_capacity", title: "Organizational Capacity", description: "Relevant people, programs, and experience.", requiredSources: ["organization.mission"], optionalSources: ["organization.programs", "organization.previous_grant_experience", "application.staffResponsible"], maxWords: 300, aiEnabled: true, deterministic: false, order: 12 },
  { id: "conclusion", title: "Conclusion", description: "A concise close tied to the request.", requiredSources: ["application.projectSummary", "application.measurableOutcomes"], optionalSources: ["organization.mission"], maxWords: 150, aiEnabled: true, deterministic: false, order: 13 },
  { id: "attachments", title: "Required Attachments Checklist", description: "Known funder-required documents.", requiredSources: [], optionalSources: ["grant.requiredDocuments"], maxWords: 150, aiEnabled: false, deterministic: true, order: 14 },
];

export interface InitialApplicationSection {
  section_key: string;
  title: string;
  content: string;
  status: "not_started" | "draft";
  template_version: string;
  used_source_fields: string[];
}

function coverContent(organization: Organization, setup: ApplicationSetupInput, grant: Grant | null) {
  return [
    `Organization: ${organization.organization_name}`,
    `Project: ${setup.projectName}`,
    grant ? `Grant: ${grant.title}` : null,
    grant ? `Funder: ${grant.funder}` : null,
    `Amount requested: $${setup.amountRequested.toLocaleString("en-US")}`,
    `Project period: ${setup.projectStartDate} to ${setup.projectEndDate}`,
  ].filter(Boolean).join("\n");
}

function attachmentContent(grant: Grant | null) {
  const documents = grant?.requiredDocuments ?? [];
  return documents.length > 0
    ? documents.map((document) => `[ ] ${document}`).join("\n")
    : "[NEEDS INPUT: Confirm the funder's required attachments]";
}

export function buildInitialApplicationSections(
  organization: Organization,
  setup: ApplicationSetupInput,
  grant: Grant | null,
): InitialApplicationSection[] {
  return proposalTemplate.map((section) => {
    if (section.id === "cover_information") {
      return {
        section_key: section.id,
        title: section.title,
        content: coverContent(organization, setup, grant),
        status: "draft",
        template_version: PROPOSAL_TEMPLATE_VERSION,
        used_source_fields: section.requiredSources,
      };
    }
    if (section.id === "attachments") {
      return {
        section_key: section.id,
        title: section.title,
        content: attachmentContent(grant),
        status: "draft",
        template_version: PROPOSAL_TEMPLATE_VERSION,
        used_source_fields: grant?.requiredDocuments?.length ? ["grant.requiredDocuments"] : [],
      };
    }
    return {
      section_key: section.id,
      title: section.title,
      content: "",
      status: "not_started",
      template_version: PROPOSAL_TEMPLATE_VERSION,
      used_source_fields: [],
    };
  });
}
