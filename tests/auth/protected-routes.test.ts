import { describe, expect, it } from "vitest";
import { PROTECTED_ROUTES } from "@/lib/auth/constants";

function isProtected(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

describe("grant route access", () => {
  it("requires authentication for the finder and full grant details", () => {
    expect(isProtected("/grants")).toBe(true);
    expect(isProtected("/grants/example-grant")).toBe(true);
  });

  it("allows public opportunity previews", () => {
    expect(isProtected("/opportunities/example-grant")).toBe(false);
  });
});
