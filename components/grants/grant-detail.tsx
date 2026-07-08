"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Bookmark, Check, ExternalLink, Lightbulb, Share2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleSavedGrant } from "@/app/actions/saved-grants";
import { AppShell } from "@/components/layout";
import { PublicNav } from "@/components/marketing/public-nav";
import {
  Badge,
  Button,
  Card,
  getDeadlineVariant,
  MatchScore,
} from "@/components/ui";
import { eligibilityItems } from "@/data";
import { useRequireFullAccount } from "@/hooks/use-user";
import { getGrantApplicationUrl } from "@/lib/grants/application-url";
import { formatCurrency } from "@/lib/utils";
import type { ScoredGrant } from "@/lib/grant-matching";

interface GrantDetailViewProps {
  grant: ScoredGrant;
  publicMode?: boolean;
  saved?: boolean;
}

export function GrantDetailView({
  grant,
  publicMode = false,
  saved = false,
}: GrantDetailViewProps) {
  const { requireFullAccount, isGuest, isAuthenticated, hasDevFullAccess } =
    useRequireFullAccount();
  const [isSaved, setIsSaved] = useState(saved);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [, startSaveTransition] = useTransition();
  const readOnly = publicMode || (!hasDevFullAccess && (!isAuthenticated || isGuest));
  const urgency = getDeadlineVariant(Math.max(grant.daysLeft, 0));
  const backHref = publicMode ? "/browse" : "/grants";
  const backLabel = publicMode ? "Back to Browse" : "Back to Finder";
  const applicationUrl = getGrantApplicationUrl(grant);

  function handleSave() {
    if (!requireFullAccount()) return;

    const previous = isSaved;
    setIsSaved(!previous);

    startSaveTransition(async () => {
      const result = await toggleSavedGrant(grant.id);

      if (!result.success) {
        setIsSaved(previous);
        return;
      }

      setIsSaved(result.saved);
    });
  }

  async function handleShare() {
    const url = window.location.href;

    setShareMessage(null);

    try {
      if (navigator.share) {
        await navigator.share({
          title: grant.title,
          text: `Review this grant from ${grant.funder}.`,
          url,
        });
        setShareMessage("Share sheet opened.");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareMessage("Link copied to clipboard.");
        return;
      }

      setShareMessage("Copy this page URL from your browser.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setShareMessage("Unable to share this link.");
    }
  }

  const content = (
    <>
      <div className="border-b border-border bg-surface px-4 py-4 md:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>

      <div className="mx-auto max-w-6xl p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant="default">{grant.category}</Badge>
                <Badge variant={urgency}>{grant.deadlineLabel}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-text">{grant.title}</h1>
              <p className="mt-1 text-text-secondary">{grant.funder}</p>
            </div>

            {urgency === "danger" && grant.daysLeft >= 0 && (
              <Card padding="md" className="border-danger/30 bg-danger-light/30">
                <p className="text-sm font-medium text-danger-dark">
                  Deadline approaching — {grant.daysLeft} days left to apply.
                </p>
              </Card>
            )}

            <Card padding="lg">
              <h2 className="mb-4 text-xl font-bold text-text">About this grant</h2>
              <p className="leading-relaxed text-text-secondary">{grant.description}</p>
            </Card>

            <Card padding="lg">
              <h2 className="mb-4 text-xl font-bold text-text">Eligibility checklist</h2>
              <ul className="space-y-4">
                {eligibilityItems.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    {item.met ? (
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    ) : (
                      <X className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
                    )}
                    <div>
                      <p className="font-medium text-text">{item.title}</p>
                      <p className="text-sm text-text-secondary">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            {publicMode ? (
              <Card padding="lg" className="border-primary/20 bg-primary-light/20">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-semibold text-text">AI tips</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Emphasize outcomes aligned with {grant.category.toLowerCase()} and
                      your organization&apos;s mission for the strongest application.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card padding="lg" className="border-primary/20 bg-primary-light/20">
                <h3 className="font-semibold text-text">Application</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Apply directly on the funder&apos;s website.
                </p>
                <a
                  href={applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Apply on funder site
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card padding="lg" className="sticky top-24">
              {publicMode && (
                <div className="mb-6 flex justify-center">
                  <MatchScore score={grant.matchScore} />
                </div>
              )}
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-text-secondary">Funding</dt>
                  <dd className="font-semibold">
                    {grant.amount ? formatCurrency(grant.amount) : "Amount varies"}
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Deadline</dt>
                  <dd>
                    <Badge variant={urgency}>{grant.deadlineLabel}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-text-secondary">Region</dt>
                  <dd className="font-semibold">{grant.region}</dd>
                </div>
                {!publicMode && (
                  <div>
                    <dt className="text-text-secondary">Application</dt>
                    <dd>
                      <a
                        href={applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        Apply on funder site
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </dd>
                  </div>
                )}
                {publicMode && (
                  <div>
                    <dt className="text-text-secondary">Match score</dt>
                    <dd className="font-semibold">{grant.matchScore}%</dd>
                  </div>
                )}
              </dl>
              <div className="mt-6 flex gap-2">
                <Button
                  type="button"
                  variant={isSaved ? "primary" : "secondary"}
                  size="sm"
                  className="flex-1"
                  disabled={readOnly}
                  onClick={handleSave}
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
              {shareMessage && (
                <p className="mt-2 text-xs text-text-muted">{shareMessage}</p>
              )}
              {publicMode ? (
                <Link href="/signup" className="mt-4 block">
                  <Button className="w-full" size="lg">
                    Sign Up to Apply
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <a
                  href={applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block"
                >
                  <Button className="w-full" size="lg">
                    Apply on funder site
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );

  if (publicMode) {
    return (
      <div className="min-h-screen bg-bg">
        <PublicNav showSignIn />
        {content}
      </div>
    );
  }

  return <AppShell header={null}>{content}</AppShell>;
}
