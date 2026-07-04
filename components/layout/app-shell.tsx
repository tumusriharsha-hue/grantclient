"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, History, LogOut, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { mainNavItems } from "@/data";
import { useUser, signOut } from "@/hooks/use-user";
import { getUserInitials } from "@/lib/auth/session";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = mainNavItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const nav = (
    <>
      <div className="px-5 pb-6 pt-2">
        <Link href="/dashboard" className="text-lg font-bold text-text">
          GrantClient
        </Link>
        <p className="mt-0.5 text-xs text-text-muted">AI Grant Intelligence</p>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {mainNavItems.map((item) => {
          const active = activeItem?.id === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-light/60 text-primary"
                  : "text-text-secondary hover:bg-bg hover:text-text",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-md border border-border bg-surface p-2 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-border bg-bg transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 rounded-md p-1 text-text-secondary md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {nav}
      </aside>
    </>
  );
}

interface AppHeaderProps {
  showSearch?: boolean;
  title?: string;
}

export function AppHeader({ showSearch = true, title }: AppHeaderProps) {
  const router = useRouter();
  const { user, isGuest, isAuthenticated, loading } = useUser();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur-sm md:px-8">
      <div className="w-8 md:hidden" />
      {title ? (
        <h1 className="text-lg font-semibold text-text">{title}</h1>
      ) : showSearch ? (
        <div className="mx-auto w-full max-w-md flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search grants..."
              className="w-full rounded-md border border-border bg-bg py-2 pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <div className="ml-auto flex items-center gap-3">
        {!loading && isGuest && (
          <Badge variant="neutral" className="hidden sm:inline-flex">
            Guest Mode
          </Badge>
        )}
        {!loading && !user && (
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Sign in
          </Link>
        )}
        <button
          type="button"
          className="rounded-md p-2 text-text-secondary hover:bg-bg hover:text-text"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          className="hidden rounded-md p-2 text-text-secondary hover:bg-bg hover:text-text sm:block"
          aria-label="History"
        >
          <History className="h-[18px] w-[18px]" />
        </button>
        {(isAuthenticated || isGuest) && (
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md p-2 text-text-secondary hover:bg-bg hover:text-text"
            aria-label="Sign out"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        )}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
          title={user?.email ?? "Guest"}
        >
          {getUserInitials(user)}
        </div>
      </div>
    </header>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
}

export function AppShell({ children, header }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg">
      <AppSidebar />
      <div className="md:pl-[280px]">
        {header ?? <AppHeader />}
        <main>{children}</main>
      </div>
    </div>
  );
}
