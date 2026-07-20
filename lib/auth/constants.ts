export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
  callback: "/auth/callback",
  dashboard: "/dashboard",
  grants: "/grants",
} as const;

/** Requires a signed-in, non-anonymous user */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/grants",
  "/browse",
  "/saved",
  "/applications",
  "/assistant",
  "/documents",
  "/settings",
  "/setup",
] as const;

/** Requires full account — guests can browse the dashboard and grant catalog, but not mutate data. */
export const FULL_ACCOUNT_ROUTES = [
  "/saved",
  "/applications",
  "/assistant",
  "/documents",
] as const;

export const PUBLIC_AUTH_ROUTES = ["/login", "/signup", "/auth/signin", "/auth/signup"] as const;
