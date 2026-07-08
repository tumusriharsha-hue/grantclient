import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrantDetailView } from "@/components/grants";
import { getGrantById } from "@/lib/grants/queries";
import { getCurrentUserSavedGrantIds } from "@/lib/grants/saved-grants";
import { scoreGrant } from "@/lib/grant-matching";
import { createClient } from "@/lib/supabase/server";

interface GrantDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GrantDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const grant = await getGrantById(id);

  return {
    title: grant?.title ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

export default async function GrantDetailPage({ params }: GrantDetailRouteProps) {
  const { id } = await params;
  const grant = await getGrantById(id);

  if (!grant) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    <GrantDetailView
      grant={scoreGrant(grant, organization)}
      saved={savedGrantIds.includes(grant.id)}
    />
  );
}
