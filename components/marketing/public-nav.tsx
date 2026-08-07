"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { GrantclientLogo } from "@/components/brand/grantclient-logo";
import { Button } from "@/components/ui/button";

interface PublicNavProps {
  showSignIn?: boolean;
}

export function PublicNav({ showSignIn = true }: PublicNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleSectionNavigation(
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) {
    setMobileOpen(false);

    const target = document.getElementById(sectionId);
    if (!target) return;

    event.preventDefault();
    window.history.replaceState(null, "", `#${sectionId}`);
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: "start" });
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex shrink-0" aria-label="Grantclient home">
          <GrantclientLogo className="w-[168px]" priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <Link
            href="/#how-it-works"
            onClick={(event) => handleSectionNavigation(event, "how-it-works")}
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text"
          >
            How it works
          </Link>
          <Link
            href="/#features"
            onClick={(event) => handleSectionNavigation(event, "features")}
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text"
          >
            Features
          </Link>
          <Link
            href="/grants"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text"
          >
            Browse grants
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {showSignIn && (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text md:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border bg-surface px-4 py-5 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {[
              { label: "How it works", href: "/#how-it-works", sectionId: "how-it-works" },
              { label: "Features", href: "/#features", sectionId: "features" },
              { label: "Browse grants", href: "/grants" },
            ].map(({ label, href, sectionId }) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl px-3 py-3 text-sm font-medium text-text-secondary hover:bg-bg hover:text-text"
                onClick={(event) => {
                  if (sectionId) {
                    handleSectionNavigation(event, sectionId);
                    return;
                  }

                  setMobileOpen(false);
                }}
              >
                {label}
              </Link>
            ))}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              {showSignIn && (
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign in
                  </Button>
                </Link>
              )}
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className={showSignIn ? "" : "col-span-2"}
              >
                <Button className="w-full">Get started</Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
