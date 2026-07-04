import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let organization = null;

  if (user) {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    organization = data;
  }

  return <SettingsPage user={user} organization={organization} />;
}
