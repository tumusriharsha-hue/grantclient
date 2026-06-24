"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "@/components/ui";

export function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<"signup" | "signin">(
    pathname.includes("signin") ? "signin" : "signup",
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/setup");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-primary-light/40 to-bg p-8 md:p-12">
        <div className="max-w-md text-center md:text-left">
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
          <h1 className="text-2xl font-bold text-text">
            {mode === "signup" ? "Sign up for GrantClient" : "Sign in to GrantClient"}
          </h1>

          <Button
            type="button"
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => router.push("/setup")}
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
            {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
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
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
            />
            <Button type="submit" className="w-full">
              {mode === "signup" ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-secondary">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signup" ? "Sign In →" : "Sign Up →"}
            </button>
          </p>

          <div className="mt-8 border-t border-border pt-6 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-text-muted underline-offset-2 hover:text-primary hover:underline"
            >
              Bypass to Demo ↗
            </Link>
            <p className="mt-1 text-xs text-text-muted">
              Skip auth and explore with mock data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
