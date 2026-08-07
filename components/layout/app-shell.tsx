"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { mainNavItems } from "@/data";
import { signOut, useUser } from "@/hooks/use-user";
import { getUserInitials } from "@/lib/auth/session";
import { GrantclientLogo } from "@/components/brand/grantclient-logo";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  clearGrantNotifications,
  getGrantNotifications,
  GRANT_NOTIFICATIONS_UPDATED_EVENT,
  type GrantNotification,
} from "@/lib/notifications/top-grant-notifications";

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeItem = mainNavItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const nav = (
    <>
      <div className="flex h-20 shrink-0 items-center border-b border-border px-2 md:group-hover/sidebar:px-5">
        <Link
          href="/"
          className="flex h-10 w-full items-center overflow-hidden rounded-md"
        >
          <GrantclientLogo className="max-w-none w-[185px] shrink-0" priority />
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-2 py-6 md:group-hover/sidebar:px-3">
        {mainNavItems.map((item) => {
          const active = activeItem?.id === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group/item flex h-11 items-center gap-3 rounded-xl px-2 text-sm font-medium transition-colors md:justify-center md:group-hover/sidebar:justify-start md:group-hover/sidebar:px-3",
                active
                  ? "bg-primary-light/70 text-primary"
                  : "text-text-secondary hover:bg-surface hover:text-text",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="md:opacity-0 md:transition-opacity md:duration-200 md:group-hover/sidebar:opacity-100">
                {item.label}
              </span>
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
        className="group fixed left-4 top-5 z-50 rounded-full border border-border bg-surface p-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary-light/40 hover:shadow-md active:translate-y-0 md:hidden"
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
          "group/sidebar fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col overflow-hidden border-r border-border bg-bg transition-[width,transform] duration-200 ease-out md:w-16 md:translate-x-0 md:hover:w-[280px]",
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
  const { user, isGuest, loading } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [grantNotifications, setGrantNotifications] = useState<
    GrantNotification[]
  >([]);
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
    if (!user || user.is_anonymous) return;

    const updateNotifications = () => {
      setGrantNotifications(getGrantNotifications(user.id));
    };
    updateNotifications();
    window.addEventListener(
      GRANT_NOTIFICATIONS_UPDATED_EVENT,
      updateNotifications,
    );
    window.addEventListener("storage", updateNotifications);

    return () => {
      window.removeEventListener(
        GRANT_NOTIFICATIONS_UPDATED_EVENT,
        updateNotifications,
      );
      window.removeEventListener("storage", updateNotifications);
    };
  }, [user]);

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

  const notificationCount = grantNotifications.length;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    const target = query
      ? `/grants?search=${encodeURIComponent(query)}`
      : "/grants";

    router.push(target);
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur-md md:px-8">
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
              className="w-full rounded-full border border-border bg-bg py-2.5 pl-10 pr-4 text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10"
            />
          </div>
        </form>
      ) : (
        <div className="flex-1" />
      )}
      <div className="ml-auto flex items-center gap-3">
        {!loading && isGuest && (
          <Badge variant="neutral" className="hidden sm:inline-flex">
            Account Required
          </Badge>
        )}
        {!loading && !user && (
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Sign in
          </Link>
        )}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            className="relative rounded-full p-2.5 text-text-secondary hover:bg-bg hover:text-text"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setProfileOpen(false);
            }}
          >
            <Bell className="h-[18px] w-[18px]" />
            {notificationCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
                {Math.min(notificationCount, 9)}
                {notificationCount > 9 ? "+" : ""}
              </span>
            )}
          </button>
          {notificationsOpen && (
            <div className="fixed left-1/2 top-16 z-50 flex max-h-[calc(100dvh-5rem)] w-[calc(100vw-3rem)] max-w-xs -translate-x-1/2 flex-col overflow-hidden rounded-md border border-border bg-surface shadow-lg sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-80 sm:max-w-[calc(100vw-2rem)] sm:translate-x-0">
              <div className="px-4 pb-1 pt-3">
                <h2 className="text-sm font-semibold text-text">Notifications</h2>
              </div>
              {grantNotifications.length > 0 ? (
                <>
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 sm:max-h-80">
                    {grantNotifications.map((notification) => (
                      <Link
                        key={notification.id}
                        href={`/grants/${encodeURIComponent(notification.grantId)}`}
                        className="block rounded-lg border border-border bg-bg px-4 py-3 shadow-sm transition hover:border-primary/40 hover:bg-primary-light/20"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <p className="text-sm font-medium text-text">
                          New top grant match
                        </p>
                        <p className="mt-1 text-xs text-primary">
                          {notification.grantTitle}
                        </p>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border p-2">
                    <button
                      type="button"
                      className="w-full rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-bg hover:text-danger"
                      onClick={() => {
                        if (!user || user.is_anonymous) return;
                        clearGrantNotifications(user.id);
                        setGrantNotifications([]);
                      }}
                    >
                      Clear notifications
                    </button>
                  </div>
                </>
              ) : (
                <p className="px-4 pb-4 pt-2 text-left text-xs text-text-muted">
                  No new notifications
                </p>
              )}
            </div>
          )}
        </div>
        <div ref={profileRef} className="relative">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
            title={user?.email ?? "Profile"}
            aria-label="Profile menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((open) => !open);
              setNotificationsOpen(false);
            }}
          >
            {getUserInitials(user)}
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-11 z-50 w-64 rounded-md border border-border bg-surface shadow-lg">
              <Link
                href="/settings"
                className="flex items-center gap-3 border-b border-border px-4 py-3 hover:bg-bg"
                onClick={() => setProfileOpen(false)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                  {getUserInitials(user)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">
                    {user?.email ?? "Profile"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-text-muted">
                    Account settings
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
      <div className="md:pl-16">
        {header ?? <AppHeader />}
        <main className="min-h-[calc(100vh-5rem)]">{children}</main>
      </div>
    </div>
  );
}
