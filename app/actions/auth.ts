"use server";

import { formatAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations/auth";

export type SignUpActionResult =
  | { success: true; requiresEmailConfirmation?: boolean }
  | { success: false; error: string };

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<SignUpActionResult> {
  const parsed = signUpSchema.safeParse({ email, password });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid sign-up details.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: formatAuthError(error.message, "signup"),
    };
  }

  return {
    success: true,
    requiresEmailConfirmation: !data.session,
  };
}
