import { createClient } from "@/lib/supabase/server";
import { mapGrantRow } from "@/lib/grants/map-grant";
import type { Grant, GrantCategory, GrantRegion } from "@/types/grant";

export async function getAllGrants(): Promise<Grant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .order("title");

  if (error) {
    throw new Error(`Failed to load grants: ${error.message}`);
  }

  return (data ?? []).map(mapGrantRow);
}

export async function getGrantById(id: string): Promise<Grant | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load grant: ${error.message}`);
  }

  return data ? mapGrantRow(data) : null;
}

export async function getGrantsByCategory(category: GrantCategory): Promise<Grant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .eq("category", category)
    .order("title");

  if (error) {
    throw new Error(`Failed to load grants: ${error.message}`);
  }

  return (data ?? []).map(mapGrantRow);
}

export async function getGrantsByRegion(region: GrantRegion): Promise<Grant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .eq("region", region)
    .order("title");

  if (error) {
    throw new Error(`Failed to load grants: ${error.message}`);
  }

  return (data ?? []).map(mapGrantRow);
}

export async function searchGrants(query: string): Promise<Grant[]> {
  const normalized = query.trim().replace(/[%_,().]/g, "");
  if (!normalized) {
    return getAllGrants();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("grants")
    .select("*")
    .or(
      `title.ilike.%${normalized}%,description.ilike.%${normalized}%,funder.ilike.%${normalized}%,category.ilike.%${normalized}%,region.ilike.%${normalized}%`,
    )
    .order("title");

  if (error) {
    throw new Error(`Failed to search grants: ${error.message}`);
  }

  return (data ?? []).map(mapGrantRow);
}
