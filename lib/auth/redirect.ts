const DEFAULT_REDIRECT = "/dashboard";

/**
 * Validates post-auth redirect paths to prevent open redirects.
 * Only same-origin relative paths are allowed.
 */
export function sanitizeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_REDIRECT,
): string {
  if (!value) {
    return fallback;
  }

  const path = value.trim();

  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)) {
    return fallback;
  }

  return path;
}
