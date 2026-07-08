import { createClient } from "@/lib/supabase/server";
import type { Grant } from "@/types/grant";

export async function getCurrentUserSavedGrantIds(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return [];
  }

  const { data, error } = await supabase
    .from("saved_grants")
    .select("grant_id")
    .eq("user_id", user.id);

  if (error) {
    throw new Error(`Failed to load saved grants: ${error.message}`);
  }

  return (data ?? []).map((row) => row.grant_id);
}

export function filterSavedGrants(grants: Grant[], savedGrantIds: string[]) {
  const saved = new Set(savedGrantIds);
  return grants.filter((grant) => saved.has(grant.id));
}
