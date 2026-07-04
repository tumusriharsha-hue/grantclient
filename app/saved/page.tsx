import type { Metadata } from "next";
import { AppShell } from "@/components/layout";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Saved Grants",
};

export default function SavedGrantsPage() {
  return (
    <AppShell header={null}>
      <div className="mx-auto max-w-3xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-text">Saved Grants</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Grants you save from the Grant Finder appear here.
        </p>
        <Card padding="lg" className="mt-6">
          <p className="text-sm text-text-secondary">
            No saved grants yet. Browse the Grant Finder and save opportunities to
            track them here.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
