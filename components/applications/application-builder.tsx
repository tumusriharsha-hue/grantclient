"use client";

import { CheckCircle2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout";
import { Button, Card, Input, Textarea } from "@/components/ui";

const aiTools = [
  "Improve this answer",
  "Make it more formal",
  "Shorten / expand",
  "Match grant tone",
  "Check eligibility",
];

export function ApplicationBuilderPage() {
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
          <div className="flex gap-3">
            <Button variant="secondary">Save draft</Button>
            <Button>Continue</Button>
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

          <Button className="w-full">
            <Wand2 className="h-4 w-4" />
            Generate first draft
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
