import type { Metadata } from "next";
import Link from "next/link";
import { applicationStatus } from "@/data";
import { AppHeader, AppShell } from "@/components/layout";
import { Badge, Button, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "My Applications",
};

export default function ApplicationsPage() {
  return (
    <AppShell header={<AppHeader showSearch={false} title="My Applications" />}>
      <div className="mx-auto max-w-4xl space-y-6 p-6 md:p-8">
        <div className="flex justify-end">
          <Link href="/applications/builder">
            <Button>New Application</Button>
          </Link>
        </div>
        {(
          [
            { key: "drafting", label: "Drafting", data: applicationStatus.drafting },
            { key: "submitted", label: "Submitted", data: applicationStatus.submitted },
            { key: "outcomes", label: "Outcomes", data: applicationStatus.outcomes },
          ] as const
        ).map(({ key, label, data }) => (
          <Card key={key} padding="md">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-text">{label}</h2>
              <Badge variant="neutral">{data.count}</Badge>
            </div>
            <ul className="space-y-2">
              {data.items.map((item) => (
                <li key={item.id} className="text-sm">
                  {"href" in item ? (
                    <Link href={item.href} className="text-primary hover:underline">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-text">{item.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
