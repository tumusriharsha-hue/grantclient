import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrantDetailView } from "@/components/grants";
import { getGrantById } from "@/lib/grants/queries";
import { getCurrentUserSavedGrantIds } from "@/lib/grants/saved-grants";
import { scoreGrant } from "@/lib/grant-matching";
import { createClient } from "@/lib/supabase/server";
import { getAbsoluteUrl, getPageDescription } from "@/lib/seo";

interface GrantDetailRouteProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GrantDetailRouteProps): Promise<Metadata> {
  const { id } = await params;
  const grant = await getGrantById(id);
  const title = grant?.title ?? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  if (!grant) {
    return {
      title,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = getPageDescription(
    `${grant.description} Offered by ${grant.funder}.`,
  );
  const canonicalPath = `/grants/${encodeURIComponent(grant.id)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
    },
  };
}

export default async function GrantDetailPage({ params }: GrantDetailRouteProps) {
  const { id } = await params;
  const grant = await getGrantById(id);

  if (!grant) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let organization = null;
  let savedGrantIds: string[] = [];

  if (user) {
    const [{ data }, savedIds] = await Promise.all([
      supabase
        .from("organizations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      getCurrentUserSavedGrantIds(),
    ]);

    organization = data;
    savedGrantIds = savedIds;
  }

  const canonicalPath = `/grants/${encodeURIComponent(grant.id)}`;
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Grantclient",
        item: getAbsoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Grant Finder",
        item: getAbsoluteUrl("/grants"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: grant.title,
        item: getAbsoluteUrl(canonicalPath),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <GrantDetailView
        grant={scoreGrant(grant, organization)}
        saved={savedGrantIds.includes(grant.id)}
      />
    </>
  );
}
