"use client";

import Link from "next/link";
import { Bookmark, ExternalLink, PenLine } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  getDeadlineVariant,
} from "@/components/ui";
import { useRequireFullAccount } from "@/hooks/use-user";
import { getGrantApplicationUrl } from "@/lib/grants/application-url";
import { formatCurrency, cn } from "@/lib/utils";
import type { ScoredGrant } from "@/lib/grant-matching";

interface GrantBrowserCardProps {
  grant: ScoredGrant;
  saved: boolean;
  onToggleSave: (grantId: string) => void;
}

export function GrantBrowserCard({
  grant,
  saved,
  onToggleSave,
}: GrantBrowserCardProps) {
  const { isGuest, isAuthenticated, hasDevFullAccess, requireFullAccount } =
    useRequireFullAccount();
  const readOnly = !hasDevFullAccess && (!isAuthenticated || isGuest);
  const applicationUrl = getGrantApplicationUrl(grant);

  function handleSave() {
    if (!requireFullAccount()) return;
    onToggleSave(grant.id);
  }

  return (
    <Card hover padding="lg" className="min-w-0 overflow-hidden">
      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              href={`/grants/${grant.id}`}
              className="break-words text-lg font-semibold text-text hover:text-primary"
            >
              {grant.title}
            </Link>
            <p className="mt-1 break-words text-sm text-text-secondary">
              {grant.funder}
            </p>
          </div>
          <Badge
            variant="default"
            className="w-fit max-w-full self-start whitespace-nowrap"
          >
            {grant.category}
          </Badge>
        </div>

        <div className="mt-3 flex min-w-0 flex-wrap items-center gap-3 text-sm">
          <span className="font-medium text-text">
            {grant.amount ? formatCurrency(grant.amount) : "Amount varies"}
          </span>
          <span className="text-text-muted">·</span>
          <Badge variant={getDeadlineVariant(Math.max(grant.daysLeft, 0))}>
            {grant.deadlineLabel}
          </Badge>
          <span className="text-text-muted">·</span>
          <span className="min-w-0 break-words text-text-secondary">{grant.region}</span>
        </div>

        <p className="mt-3 line-clamp-2 break-words text-sm text-text-secondary">
          {grant.description}
        </p>

        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex max-w-full items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <span className="min-w-0 break-words">Apply on funder site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {readOnly && (
          <p className="mt-3 text-xs text-text-muted">
            Sign up for a free account to save grants.
          </p>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="button"
            variant={saved ? "primary" : "secondary"}
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={readOnly}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            {saved ? "Saved" : "Save"}
          </Button>
          <Link
            href={`/applications/builder?grant=${encodeURIComponent(grant.id)}`}
            className="w-full sm:w-auto"
          >
            <Button size="sm" className="w-full sm:w-auto">
              Draft application
              <PenLine className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/grants/${grant.id}`} className="w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="w-full sm:w-auto">
              View details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
