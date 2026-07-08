import type { Metadata } from "next";
import { cookies } from "next/headers";
import { DashboardPage } from "@/components/dashboard";
import { DEV_FULL_ACCESS_COOKIE, isDevFullAccessEnabled } from "@/lib/auth/dev-access";
import { getAllGrants } from "@/lib/grants/queries";
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types/database";

export const metadata: Metadata = {
  title: "Dashboard",
};

const demoOrganization: Organization = {
  accept_government_grants: true,
  annual_budget_range: "$250,000-$1M",
  budget: 500000,
  city: "Houston",
  created_at: new Date(0).toISOString(),
  has_501c3: true,
  id: "dev-demo-organization",
  is_501c3: true,
  keywords: ["Education", "Youth Development", "Technology Access"],
  location: "Houston, Texas",
  mission:
    "Temporary developer profile for testing dashboard recommendations and drafting flows.",
  mission_categories: ["Education", "Youth Development", "Technology Access"],
  onboarding_completed: true,
  onboarding_step: 6,
  organization_age_range: "5+ years",
  organization_name: "Developer Demo Nonprofit",
  organization_type: "501(c)(3) Nonprofit",
  populations_served: ["Teens (13-18)", "Low-Income Communities"],
  preferred_grant_amount: "$25,000-$100,000",
  preferred_grant_types: ["Program Funding", "General Operating Support"],
  state: "TX",
  user_id: "dev-full-access",
};

export default async function DashboardRoute() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const hasDevFullAccess = isDevFullAccessEnabled(
    cookieStore.get(DEV_FULL_ACCESS_COOKIE)?.value,
  );
  const [grants, authResult] = await Promise.all([
    getAllGrants(),
    supabase.auth.getUser(),
  ]);

  const { data: { user } } = authResult;

  let organization = null;

  if (!user && hasDevFullAccess) {
    organization = demoOrganization;
  }

  if (user) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    organization = data;
  }

  return <DashboardPage user={user} organization={organization} grants={grants} />;
}
