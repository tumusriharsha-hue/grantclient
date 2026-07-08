"use server";

import { revalidatePath } from "next/cache";
import { isGuestUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type SavedGrantActionResult =
  | { success: true; saved: boolean }
  | { success: false; error: string };

export async function toggleSavedGrant(
  grantId: string,
): Promise<SavedGrantActionResult> {
  const trimmedGrantId = grantId.trim();

  if (!trimmedGrantId) {
    return { success: false, error: "Missing grant." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Sign in to save grants." };
  }

  if (isGuestUser(user)) {
    return { success: false, error: "Create an account to save grants." };
  }

  const { data: existing, error: lookupError } = await supabase
    .from("saved_grants")
    .select("id")
    .eq("user_id", user.id)
    .eq("grant_id", trimmedGrantId)
    .maybeSingle();

  if (lookupError) {
    return { success: false, error: lookupError.message };
  }

  if (existing) {
    const { error } = await supabase
      .from("saved_grants")
      .delete()
      .eq("user_id", user.id)
      .eq("id", existing.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/grants");
    revalidatePath("/saved");

    return { success: true, saved: false };
  }

  const { error } = await supabase.from("saved_grants").insert({
    user_id: user.id,
    grant_id: trimmedGrantId,
    status: "Interested",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/grants");
  revalidatePath("/saved");

  return { success: true, saved: true };
}
