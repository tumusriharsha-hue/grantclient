"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { mainNavItems } from "@/data";
import { signOut, useUser } from "@/hooks/use-user";
import { getUserInitials } from "@/lib/auth/session";
import { GrantClientLogo } from "@/components/brand/grantclient-logo";
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
      <div className="flex justify-center px-5 pb-5 pt-5">
        <Link href="/" className="inline-flex">
          <GrantClientLogo className="-translate-x-2 w-[185px]" priority />
        </Link>
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
        className="group fixed left-4 top-4 z-50 rounded-md border border-border bg-surface p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary-light/40 hover:shadow-md active:translate-y-0 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-text-secondary transition-transform duration-200 group-hover:scale-110 group-hover:text-primary" />
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
  const { user, isGuest, hasDevFullAccess, loading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;

    const storedTheme = window.localStorage.getItem("grantclient:theme");
    return storedTheme === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem("grantclient:theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        notificationsOpen &&
        !notificationsRef.current?.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (profileOpen && !profileRef.current?.contains(target)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen, profileOpen]);

  async function handleSignOut() {
    await signOut();
    setProfileOpen(false);
    router.push("/");
    router.refresh();
  }

  function toggleTheme() {
    setDarkMode((current) => !current);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    const target = query
      ? `/grants?search=${encodeURIComponent(query)}`
      : "/grants";

    router.push(target);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur-sm md:px-8">
      <div className="w-8 md:hidden" />
      {title ? (
        <h1 className="text-lg font-semibold text-text">{title}</h1>
      ) : showSearch ? (
        <form
          className="mx-auto w-full max-w-md flex-1"
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search grants..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-md border border-border bg-bg py-2 pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
            />
          </div>
        </form>
      ) : (
        <div className="flex-1" />
      )}
      <div className="ml-auto flex items-center gap-3">
        {!loading && hasDevFullAccess && (
          <Badge variant="neutral" className="hidden sm:inline-flex">
            Developer Access
          </Badge>
        )}
        {!loading && isGuest && !hasDevFullAccess && (
          <Badge variant="neutral" className="hidden sm:inline-flex">
            Account Required
          </Badge>
        )}
        {!loading && !user && !hasDevFullAccess && (
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Sign in
          </Link>
        )}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            className="rounded-md p-2 text-text-secondary hover:bg-bg hover:text-text"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setProfileOpen(false);
            }}
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-surface shadow-lg">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-text">Notifications</h2>
                <p className="mt-0.5 text-xs text-text-muted">No new notifications</p>
              </div>
              <div className="divide-y divide-border">
                <div className="px-4 py-3">
                  <p className="text-sm font-medium text-text">New matches are available</p>
                  <Link
                    href="/grants"
                    className="mt-1 block text-xs text-primary hover:underline"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    Review recently refreshed opportunities in Grant Finder.
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={profileRef} className="relative">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
            title={user?.email ?? (hasDevFullAccess ? "Developer access" : "Profile")}
            aria-label="Profile menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((open) => !open);
              setNotificationsOpen(false);
            }}
          >
            {hasDevFullAccess && !user ? "DEV" : getUserInitials(user)}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-11 z-50 w-64 rounded-md border border-border bg-surface shadow-lg">
              <Link
                href="/settings"
                className="flex items-center gap-3 border-b border-border px-4 py-3 hover:bg-bg"
                onClick={() => setProfileOpen(false)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                  {hasDevFullAccess && !user ? "DEV" : getUserInitials(user)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {hasDevFullAccess && !user ? "Developer Access" : user?.email ?? "Profile"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    {hasDevFullAccess ? "Temporary local access" : "Account settings"}
                  </p>
                </div>
              </Link>
              <div className="py-1">
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text"
                  onClick={() => setProfileOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text"
                  onClick={() => setProfileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-bg hover:text-text"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
              <div className="border-t border-border p-2">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-sm text-text-secondary hover:bg-bg hover:text-text"
                  onClick={toggleTheme}
                >
                  <span className="flex items-center gap-2">
                    {darkMode ? (
                      <Moon className="h-4 w-4 text-primary" />
                    ) : (
                      <Sun className="h-4 w-4 text-primary" />
                    )}
                    {darkMode ? "Dark mode" : "Light mode"}
                  </span>
                  <span
                    className={cn(
                      "flex h-5 w-9 items-center rounded-full border border-border px-0.5 transition-colors",
                      darkMode ? "bg-primary" : "bg-bg",
                    )}
                    aria-hidden="true"
                  >
                    <span
                      className={cn(
                        "h-4 w-4 rounded-full bg-surface shadow-sm transition-transform",
                        darkMode && "translate-x-4",
                      )}
                    />
                  </span>
                </button>
              </div>
            </div>
          )}
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
