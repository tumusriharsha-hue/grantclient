"use client";

import { AppShell } from "@/components/layout";
import { OnboardingWizard } from "@/components/onboarding";
import { isOnboardingComplete } from "@/lib/onboarding/helpers";
import type { Organization } from "@/types/database";
import type { Grant } from "@/types/grant";
import type { User } from "@supabase/supabase-js";
import { DashboardContent, type DashboardApplicationItem } from "./dashboard-content";

interface DashboardPageProps {
  user: User | null;
  organization: Organization | null;
  grants: Grant[];
  applications: DashboardApplicationItem[];
}

export function DashboardPage({
  user,
  organization,
  grants,
  applications,
}: DashboardPageProps) {
  const isGuest = Boolean(user?.is_anonymous);
  const canEditProfile = Boolean(user && !user.is_anonymous);
  const setupComplete = isOnboardingComplete(organization);

  return (
    <AppShell>
      {setupComplete && organization ? (
        <DashboardContent
          organization={organization}
          grants={grants}
          applications={applications}
        />
      ) : (
        <OnboardingWizard
          key={organization?.id ?? "new-org"}
          organization={organization}
          canEditProfile={canEditProfile}
          isGuest={isGuest}
        />
      )}
    </AppShell>
  );
}
