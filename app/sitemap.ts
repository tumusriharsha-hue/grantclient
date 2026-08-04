import type { MetadataRoute } from "next";
import { getAllGrants } from "@/lib/grants/queries";
import { getAbsoluteUrl } from "@/lib/seo";

export const revalidate = 86400;

const staticPages: MetadataRoute.Sitemap = [
  {
    url: getAbsoluteUrl("/"),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: getAbsoluteUrl("/grants"),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: getAbsoluteUrl("/about"),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: getAbsoluteUrl("/privacy"),
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    url: getAbsoluteUrl("/terms"),
    changeFrequency: "yearly",
    priority: 0.2,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const grants = await getAllGrants();
    const grantPages: MetadataRoute.Sitemap = grants.map((grant) => ({
      url: getAbsoluteUrl(`/grants/${encodeURIComponent(grant.id)}`),
      lastModified: grant.updatedAt || grant.verifiedAt || undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...grantPages];
  } catch {
    return staticPages;
  }
}
