import type { Metadata } from "next";
import { GrantFinderPage } from "@/components/grants";
import { getAllGrants } from "@/lib/grants/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Grant Finder",
};

export default async function GrantsPage() {
  const supabase = await createClient();
  const [grants, authResult] = await Promise.all([
    getAllGrants(),
    supabase.auth.getUser(),
  ]);

  const { data: { user } } = authResult;

  let organization = null;

  if (user) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    organization = data;
  }

  return <GrantFinderPage organization={organization} grants={grants} />;
}
