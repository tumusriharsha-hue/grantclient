import type { Metadata } from "next";
import { siteMetadata } from "@/data";

export const SITE_URL = "https://www.grantclient.com";

export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export function getAbsoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function getPageDescription(description: string, maxLength = 160) {
  const normalized = description.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export const organizationStructuredData = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: siteMetadata.title,
  url: SITE_URL,
  logo: getAbsoluteUrl("/brand/grantclient-logo-transparent.png"),
  email: "support@grantclient.com",
  sameAs: ["https://www.instagram.com/grantclient/"],
};
