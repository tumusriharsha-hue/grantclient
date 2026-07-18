import "server-only";

import type { RecommendedGrant } from "@/lib/grants/matching-types";
import { getAllGrants } from "@/lib/grants/queries";
import { rankRecommendedGrants } from "@/lib/grants/rank-recommended-grants";
import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types/database";

export async function getRecommendedGrants(limit = 5): Promise<{
  organization: Organization | null;
  grants: RecommendedGrant[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return { organization: null, grants: [] };
  }

  const [{ data: organization, error }, grants] = await Promise.all([
    supabase.from("organizations").select("*").eq("user_id", user.id).maybeSingle(),
    getAllGrants(),
  ]);

  if (error) {
    throw new Error("Unable to load the organization profile.");
  }

  return {
    organization,
    grants: organization ? rankRecommendedGrants(organization, grants, { limit }) : [],
  };
}
