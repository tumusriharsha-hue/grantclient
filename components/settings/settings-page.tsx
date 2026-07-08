"use client";

import { useState } from "react";
import { AppHeader, AppShell } from "@/components/layout";
import { OnboardingWizard } from "@/components/onboarding";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ProfilePictureUploader } from "./profile-picture-uploader";
import type { Organization } from "@/types/database";
import type { User } from "@supabase/supabase-js";

const sections = [
  { id: "profile", label: "Organization Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "help", label: "Help & Support" },
] as const;

type SectionId = (typeof sections)[number]["id"];

interface SettingsPageProps {
  user: User | null;
  organization: Organization | null;
}

export function SettingsPage({ user, organization }: SettingsPageProps) {
  const [active, setActive] = useState<SectionId>("profile");
  const isGuest = Boolean(user?.is_anonymous);
  const canEditProfile = Boolean(user && !user.is_anonymous);

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
            <div className="space-y-5">
              <Card padding="md">
                <h2 className="text-xl font-bold text-text">Organization Profile</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Update your onboarding answers to improve grant recommendations.
                </p>
              </Card>
              <ProfilePictureUploader
                userId={user?.id ?? null}
                organizationName={organization?.organization_name ?? "GrantClient"}
                initialUrl={organization?.profile_picture_url}
                canEditProfile={canEditProfile && Boolean(organization)}
              />
              <OnboardingWizard
                key={organization?.id ?? "new-org"}
                organization={organization}
                canEditProfile={canEditProfile}
                isGuest={isGuest}
                mode="settings"
              />
            </div>
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

          {active === "help" && (
            <Card padding="lg">
              <h2 className="text-xl font-bold text-text">Help & Support</h2>
              <p className="mt-2 text-sm text-text-secondary">Coming soon.</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
