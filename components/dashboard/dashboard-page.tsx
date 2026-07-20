"use client";

import { AppShell } from "@/components/layout";
import { OnboardingWizard } from "@/components/onboarding";
import { isOnboardingComplete } from "@/lib/onboarding/helpers";
import type { Organization } from "@/types/database";
import type { RecommendedGrant } from "@/lib/grants/matching-types";
import type { User } from "@supabase/supabase-js";
import { DashboardContent, type DashboardApplicationItem } from "./dashboard-content";

interface DashboardPageProps {
  user: User | null;
  organization: Organization | null;
  recommendedGrants: RecommendedGrant[];
  applications: DashboardApplicationItem[];
}

export function DashboardPage({
  user,
  organization,
  recommendedGrants,
  applications,
}: DashboardPageProps) {
  const isGuest = Boolean(user?.is_anonymous);
  const canEditProfile = Boolean(user);
  const setupComplete = isOnboardingComplete(organization);

  return (
    <AppShell>
      {setupComplete && organization ? (
        <DashboardContent
          organization={organization}
          recommendedGrants={recommendedGrants}
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
