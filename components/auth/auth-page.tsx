"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { formatAuthError } from "@/lib/auth/errors";
import { signUpWithEmail } from "@/app/actions/auth";
import { GrantClientLogo } from "@/components/brand/grantclient-logo";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

interface AuthPageProps {
  mode: "signup" | "signin";
}

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const nextPath = sanitizeRedirectPath(
    searchParams.get("next"),
    AUTH_ROUTES.dashboard,
  );
  const accountRequired = searchParams.get("reason") === "account";
  const formDisabled = isSubmitting || Boolean(successMessage);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submittingRef.current) return;

    setError(null);
    setSuccessMessage(null);
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const result = await signUpWithEmail(email, password);

        if (!result.success) {
          setError(result.error);
          return;
        }

        if (result.requiresEmailConfirmation) {
          setSuccessMessage("Check your email to confirm your account, then sign in.");
          return;
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(formatAuthError(signInError.message, "signin"));
        return;
      }

      if (!data.session) {
        setError(
          "Sign-in did not complete. If you just signed up, confirm your email first.",
        );
        return;
      }

      router.push(nextPath);
      router.refresh();
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleGoogleAuth() {
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}${AUTH_ROUTES.callback}?next=${encodeURIComponent(nextPath)}`;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    setIsSubmitting(false);

    if (authError) {
      setError(authError.message);
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-primary-light/70 via-surface to-bg p-8 md:p-12">
        <div className="max-w-md text-center md:text-left">
          <GrantClientLogo className="mx-auto mb-8 w-[245px] md:mx-0" priority />
          <h2 className="text-2xl font-bold text-text">
            Grants made simple for nonprofits
          </h2>
          <p className="mt-3 text-text-secondary">
            Discover funding opportunities, draft applications with AI, and track
            every submission in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface p-8">
        <div className="w-full max-w-sm">
          <GrantClientLogo className="mb-8 w-[190px]" priority />
          <h1 className="text-2xl font-bold text-text">
            {mode === "signup" ? "Create your account" : "Sign in to GrantClient"}
          </h1>

          {accountRequired && (
            <p className="mt-3 rounded-md bg-primary-light/20 px-3 py-2 text-sm text-text-secondary">
              Sign in or create a free account to access GrantClient.
            </p>
          )}

          <Button
            type="button"
            variant="secondary"
            className="mt-6 w-full"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@nonprofit.org"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={formDisabled}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              disabled={formDisabled}
            />
            {successMessage && (
              <div className="space-y-3 rounded-md bg-success-light px-3 py-2 text-sm text-success-dark">
                <p>{successMessage}</p>
                <Link
                  href={`${AUTH_ROUTES.login}?next=${encodeURIComponent(nextPath)}`}
                  className="font-medium underline"
                >
                  Go to sign in →
                </Link>
              </div>
            )}
            {error && (
              <div className="space-y-2 rounded-md bg-danger-light px-3 py-2 text-sm text-danger-dark">
                <p>{error}</p>
                {mode === "signup" &&
                  error.toLowerCase().includes("already registered") && (
                    <Link
                      href={`${AUTH_ROUTES.login}?next=${encodeURIComponent(nextPath)}`}
                      className="font-medium underline"
                    >
                      Go to sign in →
                    </Link>
                  )}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={formDisabled}>
              {isSubmitting
                ? mode === "signup"
                  ? "Creating account..."
                  : "Signing in..."
                : mode === "signup"
                  ? "Sign Up"
                  : "Sign In"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-secondary">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={mode === "signup" ? AUTH_ROUTES.login : AUTH_ROUTES.signup}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signup" ? "Sign In →" : "Sign Up →"}
            </Link>
          </p>

          <p className="mt-6 text-center text-xs leading-relaxed text-text-muted">
            By {mode === "signup" ? "creating an account" : "signing in"}, you agree to
            our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
