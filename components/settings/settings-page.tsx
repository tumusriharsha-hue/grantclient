"use client";

import { useState } from "react";
import { AppHeader, AppShell } from "@/components/layout";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

const sections = [
  { id: "profile", label: "Organization Profile" },
  { id: "team", label: "Team Members" },
  { id: "notifications", label: "Notifications" },
  { id: "accounts", label: "Linked Accounts" },
  { id: "help", label: "Help & Support" },
] as const;

type SectionId = (typeof sections)[number]["id"];

export function SettingsPage() {
  const [active, setActive] = useState<SectionId>("profile");

  return (
    <AppShell header={<AppHeader showSearch={false} title="Settings" />}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6 md:flex-row md:p-8">
        <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-56 md:flex-col">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActive(section.id)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                active === section.id
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-bg hover:text-text",
              )}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {active === "profile" && (
            <Card padding="lg">
              <h2 className="mb-6 text-xl font-bold text-text">
                Organization Profile
              </h2>
              <div className="space-y-5">
                <Input label="Organization name" defaultValue="Urban Reach Initiative" />
                <Input label="Website" defaultValue="https://urbanreach.org" />
                <Input label="EIN (Tax ID)" defaultValue="12-3456789" />
                <Textarea
                  label="Mission statement"
                  rows={4}
                  defaultValue="To empower underserved communities through sustainable technology education."
                />
                <Input label="Location" defaultValue="Brooklyn, NY" />
              </div>
              <div className="mt-6 flex justify-end">
                <Button>Save changes</Button>
              </div>
            </Card>
          )}

          {active === "team" && (
            <Card padding="lg">
              <h2 className="mb-4 text-xl font-bold text-text">Team Members</h2>
              <p className="text-sm text-text-secondary">
                Invite colleagues to collaborate on grant applications.
              </p>
              <div className="mt-4 flex gap-2">
                <Input placeholder="Email address" className="flex-1" />
                <Button>Invite</Button>
              </div>
            </Card>
          )}

          {active === "notifications" && (
            <Card padding="lg">
              <h2 className="mb-4 text-xl font-bold text-text">Notifications</h2>
              <div className="space-y-4">
                {[
                  "Email on grant matches",
                  "Email on deadline reminders",
                  "Email on application updates",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-3 text-sm">
                    <input type="checkbox" defaultChecked className="rounded" />
                    {item}
                  </label>
                ))}
              </div>
            </Card>
          )}

          {active !== "profile" && active !== "team" && active !== "notifications" && (
            <Card padding="lg">
              <h2 className="text-xl font-bold text-text">
                {sections.find((s) => s.id === active)?.label}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">Coming soon.</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
