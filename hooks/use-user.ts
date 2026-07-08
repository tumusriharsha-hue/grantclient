"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { DEV_FULL_ACCESS_COOKIE, DEV_FULL_ACCESS_KEY } from "@/lib/auth/dev-access";
import { isAuthenticatedUser, isGuestUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";

interface UseUserResult {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  hasDevFullAccess: boolean;
}

function subscribeDevFullAccess(listener: () => void) {
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener("storage", listener);
  };
}

function getDevFullAccessSnapshot(): boolean {
  return window.localStorage.getItem(DEV_FULL_ACCESS_KEY) === "true";
}

function getDevFullAccessServerSnapshot(): boolean {
  return false;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasDevFullAccess = useSyncExternalStore(
    subscribeDevFullAccess,
    getDevFullAccessSnapshot,
    getDevFullAccessServerSnapshot,
  );

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    isGuest: isGuestUser(user),
    isAuthenticated: isAuthenticatedUser(user),
    hasDevFullAccess,
  };
}

export function useRequireFullAccount() {
  const router = useRouter();
  const { user, loading, isGuest, isAuthenticated, hasDevFullAccess } = useUser();

  const requireFullAccount = useCallback(() => {
    if (loading) return false;

    if (hasDevFullAccess) {
      return true;
    }

    if (!user) {
      router.push(AUTH_ROUTES.login);
      return false;
    }

    if (isGuest) {
      router.push(`${AUTH_ROUTES.signup}?reason=account`);
      return false;
    }

    return true;
  }, [hasDevFullAccess, isGuest, loading, router, user]);

  return {
    user,
    loading,
    isGuest,
    isAuthenticated,
    hasDevFullAccess,
    requireFullAccount,
  };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.localStorage.removeItem(DEV_FULL_ACCESS_KEY);
  document.cookie = `${DEV_FULL_ACCESS_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
