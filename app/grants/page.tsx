import type { Metadata } from "next";
import { GrantFinderPage } from "@/components/grants";
import { getAllGrants } from "@/lib/grants/queries";
import { getCurrentUserSavedGrantIds } from "@/lib/grants/saved-grants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Grant Finder",
};

interface GrantsRouteProps {
  searchParams: Promise<{ search?: string | string[] }>;
}

function getInitialSearch(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function GrantsPage({ searchParams }: GrantsRouteProps) {
  const { search } = await searchParams;
  const initialSearch = getInitialSearch(search);
  const supabase = await createClient();
  const [grants, authResult] = await Promise.all([
    getAllGrants(),
    supabase.auth.getUser(),
  ]);

  const { data: { user } } = authResult;

  let organization = null;
  let savedGrantIds: string[] = [];

  if (user) {
    const [{ data }, savedIds] = await Promise.all([
      supabase
        .from("organizations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      getCurrentUserSavedGrantIds(),
    ]);

    organization = data;
    savedGrantIds = savedIds;
  }

  return (
    <GrantFinderPage
      key={initialSearch}
      organization={organization}
      grants={grants}
      savedGrantIds={savedGrantIds}
      initialSearch={initialSearch}
    />
  );
}
