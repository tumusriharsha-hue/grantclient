"use client";

import { File, Grid3X3, List, Upload } from "lucide-react";
import { useState } from "react";
import { templateDocuments, userDocuments } from "@/data";
import { AppHeader, AppShell } from "@/components/layout";
import { Badge, Button, Card } from "@/components/ui";

const typeColors: Record<string, string> = {
  PDF: "bg-danger-light text-danger-dark",
  Word: "bg-primary-light text-primary-hover",
  Excel: "bg-success-light text-success-dark",
  Image: "bg-warning-light text-warning-dark",
};

export function DocumentsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <AppShell header={<AppHeader showSearch={false} title="Documents" />}>
      <div className="mx-auto max-w-6xl p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button>
            <Upload className="h-4 w-4" />
            Upload Documents
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search files..."
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
            />
            <div className="flex rounded-md border border-border">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`p-2 ${view === "grid" ? "bg-bg text-primary" : "text-text-muted"}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`p-2 ${view === "list" ? "bg-bg text-primary" : "text-text-muted"}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-text">My Uploads</h2>
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg">
                    <File className="h-5 w-5 text-text-secondary" />
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
          <h2 className="mb-4 text-lg font-bold text-text">Templates</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templateDocuments.map((doc) => (
              <Card key={doc.id} hover padding="md">
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-text">{doc.name}</p>
                    <p className="text-xs text-text-muted">Provided by GrantClient</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
