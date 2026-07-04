"use server";

import { formatAuthError } from "@/lib/auth/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { signUpSchema } from "@/lib/validations/auth";

export type SignUpActionResult =
  | { success: true }
  | { success: false; error: string };

function isExistingUserError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("already") || lower.includes("registered");
}

async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ success: true } | { success: false; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error) {
    return { success: true };
  }

  return { success: false, message: error.message };
}

async function lookupUserByEmail(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string,
) {
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

async function recoverUnconfirmedAccount(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  userId: string,
  email: string,
  password: string,
): Promise<SignUpActionResult> {
  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    email_confirm: true,
    password,
  });

  if (updateError) {
    return {
      success: false,
      error: formatAuthError(updateError.message, "signup"),
    };
  }

  const signIn = await signInWithPassword(email, password);

  if (signIn.success) {
    return { success: true };
  }

  return {
    success: false,
    error: formatAuthError(signIn.message, "signup"),
  };
}

async function handleExistingUserSignup(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string,
  password: string,
): Promise<SignUpActionResult> {
  const existingUser = await lookupUserByEmail(admin, email);

  if (existingUser && !existingUser.email_confirmed_at) {
    return recoverUnconfirmedAccount(admin, existingUser.id, email, password);
  }

  const signIn = await signInWithPassword(email, password);

  if (signIn.success) {
    return { success: true };
  }

  const lower = signIn.message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return {
      success: false,
      error:
        "This email is already registered. Sign in with your password, or use a different email.",
    };
  }

  return {
    success: false,
    error: formatAuthError(signIn.message, "signup"),
  };
}

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

  const admin = createAdminClient();

  if (!admin) {
    const hasEmptyKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY !== undefined &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.trim();

    return {
      success: false,
      error: hasEmptyKey
        ? "SUPABASE_SERVICE_ROLE_KEY is empty in .env.local. Paste your service_role key after the = sign, save the file (Cmd+S), then restart npm run dev."
        : "Sign-up is not configured on the server. Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Project Settings → API), save the file, then restart the dev server.",
    };
  }

  const { error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (createError) {
    if (!isExistingUserError(createError.message)) {
      return {
        success: false,
        error: formatAuthError(createError.message, "signup"),
      };
    }

    return handleExistingUserSignup(
      admin,
      parsed.data.email,
      parsed.data.password,
    );
  }

  const signIn = await signInWithPassword(
    parsed.data.email,
    parsed.data.password,
  );

  if (signIn.success) {
    return { success: true };
  }

  return {
    success: false,
    error: formatAuthError(signIn.message, "signup"),
  };
}
