"use client";

import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { grantMatches } from "@/data";
import { PublicNav } from "@/components/marketing/public-nav";
import {
  Badge,
  Button,
  Card,
  MatchScore,
} from "@/components/ui";

const categories = ["Education", "Environment", "Community", "Food Security"];
const locations = ["National (USA)", "Urban USA", "Pacific Northwest", "Global"];

export function BrowseGrantsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = grantMatches.filter(
    (g) =>
      !search ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.organization.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-bg">
      <PublicNav showSignIn />

      <div className="border-b border-border bg-surface px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search grants by keyword…"
            className="flex-1 rounded-md border border-border bg-bg px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          />
          <Button
            variant="secondary"
            onClick={() => setShowFilters((v) => !v)}
            className="shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-8 p-6 md:p-8">
        <aside
          className={`${showFilters ? "block" : "hidden"} w-full shrink-0 space-y-4 md:block md:w-64`}
        >
          <Card padding="md">
            <h3 className="mb-3 text-sm font-semibold text-text">Location</h3>
            <div className="space-y-2">
              {locations.map((loc) => (
                <label key={loc} className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" className="rounded border-border" />
                  {loc}
                </label>
              ))}
            </div>
          </Card>
          <Card padding="md">
            <h3 className="mb-3 text-sm font-semibold text-text">Category</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" className="rounded border-border" />
                  {cat}
                </label>
              ))}
            </div>
          </Card>
          <Button variant="ghost" size="sm" className="w-full">
            Apply Filters
          </Button>
        </aside>

        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-text-secondary">
            Showing {filtered.length} grants
          </p>
          <div className="space-y-4">
            {filtered.map((grant) => (
              <Card key={grant.id} hover padding="lg">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <MatchScore score={grant.matchScore} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/browse/${grant.id}`}
                      className="text-lg font-semibold text-text hover:text-primary"
                    >
                      {grant.title}
                    </Link>
                    <p className="text-sm text-text-secondary">{grant.organization}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-medium">{grant.amountRange}</span>
                      <span className="text-text-muted">·</span>
                      <span>Deadline: {grant.deadlineLabel}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {grant.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                    {grant.aiInsight && (
                      <p className="mt-3 text-sm italic text-text-secondary">
                        &ldquo;{grant.aiInsight}&rdquo;
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Link href={`/browse/${grant.id}`}>
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href="/auth/signup">
                        <Button size="sm">
                          Sign Up to Apply
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
