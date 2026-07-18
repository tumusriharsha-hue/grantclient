"use client";

import { CheckCircle2, Target } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { startApplicationDraft } from "@/app/actions/applications";
import { AppShell } from "@/components/layout";
import { Badge, Button, Card, Input, Textarea } from "@/components/ui";

interface ApplicationBuilderPageProps {
  organization: {
    name: string;
    mission: string;
  };
  documents: Array<{ id: string; fileName: string }>;
  grantContext?: {
    id: string;
    title: string;
    funder: string;
    category: string;
    deadline?: string;
    verifiedAt?: string;
    sourceUrl?: string;
    questions?: Array<{ id: string; question: string; required?: boolean }>;
  } | null;
}

export function ApplicationBuilderPage({
  organization,
  documents,
  grantContext,
}: ApplicationBuilderPageProps) {
  const [state, formAction, isPending] = useActionState(startApplicationDraft, {});

  return (
    <AppShell header={null}>
      <div className="border-b border-border bg-surface px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-text">Application setup</p>
            <p className="text-xs text-text-muted">Project-specific details only</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-success-dark">
            <CheckCircle2 className="h-4 w-4" />
            Organization profile loaded
          </div>
        </div>
      </div>

      <form action={formAction} className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
        <input type="hidden" name="grantId" value={grantContext?.id ?? ""} />
        {state.error && (
          <p className="rounded-md bg-danger-light px-3 py-2 text-sm text-danger-dark">
            {state.error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            {grantContext && (
              <Card padding="md" className="border-primary/20 bg-primary-light/20">
                <div className="flex gap-3">
                  <Target className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <Badge variant="default">Selected grant</Badge>
                    <h1 className="mt-2 font-semibold text-text">{grantContext.title}</h1>
                    <p className="text-sm text-text-secondary">
                      {grantContext.funder}
                      {grantContext.deadline ? ` | Deadline ${grantContext.deadline}` : ""}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-text">Project basics</h2>
              <Input label="Project or program name" name="projectName" required maxLength={500} error={state.fieldErrors?.projectName} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="Amount requested" name="amountRequested" type="number" min={1} step={1} required error={state.fieldErrors?.amountRequested} />
                <Input label="Project start" name="projectStartDate" type="date" required error={state.fieldErrors?.projectStartDate} />
                <Input label="Project end" name="projectEndDate" type="date" required error={state.fieldErrors?.projectEndDate} />
              </div>
              <Textarea label="Project summary" name="projectSummary" rows={4} required maxLength={5000} error={state.fieldErrors?.projectSummary} />
            </section>

            <section className="space-y-4 border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-text">Need and beneficiaries</h2>
              <Textarea label="Specific problem or need" name="problemStatement" rows={4} required maxLength={5000} error={state.fieldErrors?.problemStatement} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Target beneficiaries" name="targetBeneficiaries" required maxLength={500} error={state.fieldErrors?.targetBeneficiaries} />
                <Input label="Number of people served (optional)" name="peopleServed" type="number" min={1} step={1} error={state.fieldErrors?.peopleServed} />
              </div>
            </section>

            {grantContext?.questions && grantContext.questions.length > 0 && (
              <section className="space-y-4 border-t border-border pt-6">
                <div>
                  <h2 className="text-lg font-semibold text-text">Verified funder questions</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    These are separate from GrantClient&apos;s standard proposal sections.
                    {grantContext.verifiedAt ? ` Verified ${new Date(grantContext.verifiedAt).toLocaleDateString()}.` : ""}
                  </p>
                </div>
                {grantContext.questions.map((question) => (
                  <Textarea
                    key={question.id}
                    label={question.question}
                    name={`grantQuestion:${question.id}`}
                    rows={4}
                    required={question.required}
                    maxLength={5000}
                    error={state.fieldErrors?.[`grantQuestion:${question.id}`]}
                  />
                ))}
                {grantContext.sourceUrl && (
                  <a href={grantContext.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                    View verified source
                  </a>
                )}
              </section>
            )}

            <section className="space-y-4 border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-text">Plan and outcomes</h2>
              <Textarea label="Planned activities" name="plannedActivities" rows={4} required maxLength={5000} error={state.fieldErrors?.plannedActivities} />
              <Textarea label="Measurable outcomes" name="measurableOutcomes" rows={4} required maxLength={5000} error={state.fieldErrors?.measurableOutcomes} />
              <Textarea label="Evaluation approach" name="evaluationApproach" rows={4} required maxLength={5000} error={state.fieldErrors?.evaluationApproach} />
              <Textarea label="Project budget summary" name="projectBudgetSummary" rows={4} required maxLength={5000} error={state.fieldErrors?.projectBudgetSummary} />
            </section>

            <section className="space-y-4 border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-text">Helpful context</h2>
              <Textarea label="Sustainability plan (optional)" name="sustainabilityPlan" rows={3} maxLength={5000} />
              <Textarea label="Partnerships (optional)" name="partnerships" rows={3} maxLength={5000} />
              <Textarea label="Staff responsible (optional)" name="staffResponsible" rows={3} maxLength={5000} />
              <Textarea label="Application notes (optional)" name="organizationNotes" rows={3} maxLength={5000} />
              {documents.length > 0 && (
                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-text">Supporting documents</legend>
                  {documents.map((document) => (
                    <label key={document.id} className="flex items-center gap-2 text-sm text-text-secondary">
                      <input type="checkbox" name="selectedDocumentIds" value={document.id} />
                      {document.fileName}
                    </label>
                  ))}
                </fieldset>
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card padding="md">
              <h2 className="font-semibold text-text">{organization.name}</h2>
              <p className="mt-2 text-sm text-text-secondary">{organization.mission}</p>
              <Link href="/settings" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                Update organization profile
              </Link>
            </Card>
            <Card padding="md">
              <p className="text-sm text-text-secondary">
                These answers create a structured proposal. Narrative sections can be generated individually after setup.
              </p>
              <Button type="submit" className="mt-4 w-full">
                {isPending ? "Saving..." : "Save and build proposal"}
              </Button>
            </Card>
          </aside>
        </div>
      </form>
    </AppShell>
  );
}
