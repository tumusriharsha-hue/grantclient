import Link from "next/link";
import { GrantClientLogo } from "@/components/brand/grantclient-logo";
import { Button } from "@/components/ui/button";

interface PublicNavProps {
  showSignIn?: boolean;
}

export function PublicNav({ showSignIn = true }: PublicNavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="inline-flex">
          <GrantClientLogo className="w-[170px]" priority />
        </Link>
        <div className="flex items-center gap-3">
          {showSignIn && (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          <Link href="/signup">
            <Button size="sm">Get Started →</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
