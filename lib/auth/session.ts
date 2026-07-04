import type { User } from "@supabase/supabase-js";

export function isGuestUser(user: User | null | undefined): boolean {
  return Boolean(user?.is_anonymous);
}

export function isAuthenticatedUser(user: User | null | undefined): boolean {
  return Boolean(user && !user.is_anonymous);
}

export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return "Guest";
  if (user.is_anonymous) return "Guest";
  return user.email?.split("@")[0] ?? "User";
}

export function getUserInitials(user: User | null | undefined): string {
  const name = getUserDisplayName(user);
  return name.slice(0, 2).toUpperCase();
}
