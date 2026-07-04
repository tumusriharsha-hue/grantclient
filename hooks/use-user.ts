"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { isAuthenticatedUser, isGuestUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/client";

interface UseUserResult {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
  };
}

export function useRequireFullAccount() {
  const router = useRouter();
  const { user, loading, isGuest, isAuthenticated } = useUser();

  const requireFullAccount = useCallback(() => {
    if (loading) return false;

    if (!user) {
      router.push(AUTH_ROUTES.login);
      return false;
    }

    if (isGuest) {
      router.push(`${AUTH_ROUTES.signup}?reason=guest`);
      return false;
    }

    return true;
  }, [isGuest, loading, router, user]);

  return {
    user,
    loading,
    isGuest,
    isAuthenticated,
    requireFullAccount,
  };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
