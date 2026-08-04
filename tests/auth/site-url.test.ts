import { afterEach, describe, expect, it } from "vitest";
import { getSiteOrigin } from "@/lib/auth/site-url";

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
});

describe("getSiteOrigin", () => {
  it("prefers the configured public site origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://grantclient.com/some/path";

    expect(getSiteOrigin("http://localhost:3000")).toBe(
      "https://grantclient.com",
    );
  });

  it("uses the current request origin when no site URL is configured", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getSiteOrigin("https://preview.example.com")).toBe(
      "https://preview.example.com",
    );
  });

  it("ignores invalid and non-http configured URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "javascript:alert(1)";

    expect(getSiteOrigin("https://grantclient.com")).toBe(
      "https://grantclient.com",
    );
  });
});
