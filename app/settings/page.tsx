import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let organization = null;
  let documents: Tables<"organization_documents">[] = [];

  if (user) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    organization = data;
    if (organization) {
      const { data: storedDocuments } = await supabase
        .from("organization_documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("organization_id", organization.id)
        .order("created_at", { ascending: false });
      documents = storedDocuments ?? [];
    }
  }

  return <SettingsPage user={user} organization={organization} documents={documents} />;
}
