"use client";

import { File, Grid3X3, List, Upload } from "lucide-react";
import { useState } from "react";
import { templateDocuments, userDocuments } from "@/data";
import { AppShell } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  Input,
  PageContainer,
  PageHeading,
  SectionHeading,
} from "@/components/ui";

const typeColors: Record<string, string> = {
  PDF: "bg-danger-light text-danger-dark",
  Word: "bg-primary-light text-primary-hover",
  Excel: "bg-success-light text-success-dark",
  Image: "bg-warning-light text-warning-dark",
};

export function DocumentsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <AppShell header={null}>
      <PageContainer size="lg" className="space-y-10 py-8 sm:py-10 lg:py-12">
        <PageHeading
          eyebrow="Organization workspace"
          title="Documents"
          description="Keep reusable files and Grantclient templates organized for application work."
          actions={
            <Button>
              <Upload className="h-4 w-4" />
              Upload documents
            </Button>
          }
        />

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-sm">
            <Input type="search" placeholder="Search files..." />
          </div>
          <div className="flex w-fit rounded-xl border border-border bg-bg p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`rounded-lg p-2 transition-colors ${view === "grid" ? "bg-surface text-primary shadow-sm" : "text-text-muted hover:text-text"}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`rounded-lg p-2 transition-colors ${view === "list" ? "bg-surface text-primary shadow-sm" : "text-text-muted hover:text-text"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
          </div>
        </div>

        <section>
          <SectionHeading
            title="My uploads"
            description="Files available for your organization and application workflow."
          />
          <div
            className={
              view === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-2"
            }
          >
            {userDocuments.map((doc) => (
              <Card key={doc.id} hover padding="md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <File className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-text">{doc.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge className={typeColors[doc.type]}>{doc.type}</Badge>
                      {doc.tags.map((tag) => (
                        <Badge key={tag} variant="neutral">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{doc.modified}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading
            title="Templates"
            description="Reusable starting points provided by Grantclient."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templateDocuments.map((doc) => (
              <Card key={doc.id} hover padding="md">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-text">{doc.name}</p>
                    <p className="text-xs text-text-muted">Provided by Grantclient</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
