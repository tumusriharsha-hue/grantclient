import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing";
import { siteMetadata } from "@/data";
import {
  SITE_URL,
  organizationStructuredData,
} from "@/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    organizationStructuredData,
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: siteMetadata.title,
      url: SITE_URL,
      description: siteMetadata.description,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#application`,
      name: siteMetadata.title,
      url: SITE_URL,
      description: siteMetadata.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      provider: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <LandingPage />
    </>
  );
}
