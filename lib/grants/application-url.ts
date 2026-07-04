import type { Grant } from "@/types/grant";

type GrantWithApplicationUrl = Pick<Grant, "id" | "applicationUrl" | "funder">;

export function getGrantApplicationUrl(grant: GrantWithApplicationUrl): string {
  if (grant.applicationUrl) {
    return grant.applicationUrl;
  }

  const funderSlug = grant.funder
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return `https://${funderSlug}.org/grants/apply/${grant.id}`;
}
