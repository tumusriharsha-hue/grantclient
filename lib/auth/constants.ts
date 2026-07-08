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
  "/saved",
  "/applications",
  "/assistant",
  "/documents",
  "/settings",
  "/setup",
] as const;

/** Requires full account — guests are redirected to signup */
export const FULL_ACCOUNT_ROUTES = [
  "/dashboard",
  "/saved",
  "/applications",
  "/assistant",
  "/settings",
  "/setup",
] as const;

export const PUBLIC_AUTH_ROUTES = ["/login", "/signup", "/auth/signin", "/auth/signup"] as const;
