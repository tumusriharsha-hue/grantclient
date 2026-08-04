function parseHttpOrigin(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Returns the canonical public origin when configured, otherwise the origin
 * serving the current request. Keeping this in one place prevents OAuth from
 * using an internal/localhost origin behind a production reverse proxy.
 */
export function getSiteOrigin(requestOrigin?: string): string {
  return (
    parseHttpOrigin(process.env.NEXT_PUBLIC_SITE_URL) ??
    parseHttpOrigin(requestOrigin) ??
    "http://localhost:3000"
  );
}
