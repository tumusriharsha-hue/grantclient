import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout";
import { Badge, Button, Card, getDeadlineVariant } from "@/components/ui";
import { formatGrantDeadline } from "@/lib/grant-matching";
import { getAllGrants } from "@/lib/grants/queries";
import { filterSavedGrants, getCurrentUserSavedGrantIds } from "@/lib/grants/saved-grants";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Saved Grants",
};

export default async function SavedGrantsPage() {
  const [grants, savedGrantIds] = await Promise.all([
    getAllGrants(),
    getCurrentUserSavedGrantIds(),
  ]);
  const savedGrants = filterSavedGrants(grants, savedGrantIds);

  return (
    <AppShell header={null}>
      <div className="mx-auto max-w-5xl space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Saved Grants</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Grants you save from the Grant Finder appear here.
            </p>
          </div>
          <Link href="/grants">
            <Button variant="secondary">Browse grants</Button>
          </Link>
        </div>

        {savedGrants.length === 0 ? (
          <Card padding="lg">
            <p className="text-sm text-text-secondary">
              No saved grants yet. Browse the Grant Finder and save opportunities to
              track them here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedGrants.map((grant) => (
              <Card key={grant.id} hover padding="lg">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge variant="default">{grant.category}</Badge>
                      <Badge variant={getDeadlineVariant(formatGrantDeadline(grant.deadline).daysLeft)}>
                        {formatGrantDeadline(grant.deadline).deadlineLabel}
                      </Badge>
                    </div>
                    <Link
                      href={`/grants/${grant.id}`}
                      className="break-words text-lg font-semibold text-text hover:text-primary"
                    >
                      {grant.title}
                    </Link>
                    <p className="mt-1 text-sm text-text-secondary">{grant.funder}</p>
                    <p className="mt-2 text-sm font-medium text-text">
                      {grant.amount ? formatCurrency(grant.amount) : "Amount varies"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:w-44">
                    <Link href={`/applications/builder?grant=${encodeURIComponent(grant.id)}`}>
                      <Button className="w-full" size="sm">
                        Draft application
                      </Button>
                    </Link>
                    <Link href={`/grants/${grant.id}`}>
                      <Button variant="secondary" className="w-full" size="sm">
                        View details
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
