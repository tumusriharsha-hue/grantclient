"use client";

import { CheckCircle2, Sparkles, Target, Wand2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { startApplicationDraft } from "@/app/actions/applications";
import { AppShell } from "@/components/layout";
import { Badge, Button, Card, Input, Textarea } from "@/components/ui";

const aiTools = [
  "Improve this answer",
  "Make it more formal",
  "Shorten / expand",
  "Match grant tone",
  "Check eligibility",
];

interface ApplicationBuilderPageProps {
  grantContext?: {
    id: string;
    title: string;
    funder: string;
    category: string;
    deadline?: string;
    applicationUrl?: string;
  } | null;
}

export function ApplicationBuilderPage({ grantContext }: ApplicationBuilderPageProps) {
  const [saved] = useState("2 minutes ago");

  return (
    <AppShell header={null}>
      <div className="border-b border-border bg-surface px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text">
              Organization Details — 60% complete
            </p>
            <div className="mt-2 h-2 w-full max-w-xs overflow-hidden rounded-full bg-bg">
              <div className="h-full w-[60%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-success-dark">
            <CheckCircle2 className="h-4 w-4" />
            Last saved {saved}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-0 lg:grid-cols-2">
        <div className="space-y-6 border-b border-border p-6 md:p-8 lg:border-b-0 lg:border-r">
          {grantContext && (
            <Card padding="md" className="border-primary/20 bg-primary-light/20">
              <div className="flex gap-3">
                <Target className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="default">Drafting for grant</Badge>
                    <span className="text-xs text-text-muted">{grantContext.category}</span>
                  </div>
                  <h2 className="break-words font-semibold text-text">
                    {grantContext.title}
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    {grantContext.funder}
                    {grantContext.deadline ? ` · Deadline ${grantContext.deadline}` : ""}
                  </p>
                </div>
                <Link
                  href="/applications/builder"
                  aria-label="Remove selected grant"
                  title="Remove selected grant"
                  className="group -mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/80 bg-surface/80 text-text-muted shadow-sm transition-all hover:-translate-y-0.5 hover:border-danger/30 hover:bg-danger-light hover:text-danger-dark focus:outline-none focus:ring-[3px] focus:ring-danger/10"
                >
                  <X className="h-4 w-4 transition-transform group-hover:scale-110" />
                </Link>
              </div>
            </Card>
          )}
          <Input label="Organization name" defaultValue="Urban Reach Initiative" />
          <Textarea
            label="Mission statement"
            hint="e.g., 'We serve 500+ teens in Brooklyn through literacy programs'"
            rows={4}
            defaultValue="To empower underserved communities through sustainable technology education and equitable access to learning resources."
          />
          <Input label="Annual budget" placeholder="$500,000" defaultValue="$750,000" />
          <Textarea
            label="Impact goals"
            rows={3}
            placeholder="Describe the outcomes you aim to achieve..."
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text">
              Supporting documents
            </label>
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-bg p-6 text-center">
              <p className="text-sm text-text-secondary">
                Drag and drop files here, or{" "}
                <button type="button" className="font-medium text-primary hover:underline">
                  browse
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg p-6 md:p-8">
          <Card padding="md" className="mb-6 border-primary/20 bg-primary-light/20">
            <div className="flex gap-2">
              <Sparkles className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold text-text">AI Match Reasoning</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  This grant aligns with your youth education focus and urban
                  program locations. Highlight your 2023 literacy outcomes for
                  the strongest match.
                </p>
              </div>
            </div>
          </Card>

          <h3 className="mb-3 text-sm font-semibold text-text">Quick tools</h3>
          <div className="mb-6 flex flex-wrap gap-2">
            {aiTools.map((tool) => (
              <button
                key={tool}
                type="button"
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
              >
                {tool}
              </button>
            ))}
          </div>

          <form action={startApplicationDraft}>
            <input type="hidden" name="grantId" value={grantContext?.id ?? ""} />
            <input type="hidden" name="grantTitle" value={grantContext?.title ?? ""} />
            <input type="hidden" name="grantFunder" value={grantContext?.funder ?? ""} />
            <input type="hidden" name="grantCategory" value={grantContext?.category ?? ""} />
            <input
              type="hidden"
              name="applicationUrl"
              value={grantContext?.applicationUrl ?? ""}
            />
            <Button type="submit" className="w-full">
              <Wand2 className="h-4 w-4" />
              Generate first draft
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
