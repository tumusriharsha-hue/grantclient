import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/marketing";
import { Badge, Button, Card } from "@/components/ui";
import { getGrantById } from "@/lib/grants/queries";
import { getAbsoluteUrl, getPageDescription } from "@/lib/seo";
import { formatCurrency } from "@/lib/utils";
import type { Grant } from "@/types/grant";

interface OpportunityPreviewPageProps {
  params: Promise<{ id: string }>;
}

function formatAward(grant: Grant) {
  const minimum = grant.awardMin ?? grant.amount;
  const maximum = grant.awardMax ?? grant.amount;

  if (minimum !== undefined && maximum !== undefined && minimum !== maximum) {
    return `${formatCurrency(minimum)}–${formatCurrency(maximum)}`;
  }
  if (minimum !== undefined || maximum !== undefined) {
    return formatCurrency(minimum ?? maximum ?? 0);
  }
  return "Amount varies";
}

function formatDeadline(grant: Grant) {
  if (grant.rollingDeadline || grant.deadlineType === "rolling") return "Rolling deadline";
  if (!grant.deadline) return "Deadline varies";

  const date = new Date(grant.deadline);
  if (Number.isNaN(date.getTime())) return grant.deadline;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export async function generateMetadata({
  params,
}: OpportunityPreviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const grant = await getGrantById(id);

  if (!grant) {
    return {
      title: "Grant opportunity",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/opportunities/${encodeURIComponent(grant.id)}`;
  const title = `${grant.title} Grant`;
  const description = getPageDescription(
    `${grant.title} from ${grant.funder}. ${grant.description}`,
  );

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "website",
    },
  };
}

export default async function OpportunityPreviewPage({
  params,
}: OpportunityPreviewPageProps) {
  const { id } = await params;
  const grant = await getGrantById(id);

  if (!grant) notFound();

  const previewPath = `/opportunities/${encodeURIComponent(grant.id)}`;
  const fullGrantPath = `/grants/${encodeURIComponent(grant.id)}`;
  const loginHref = `/login?next=${encodeURIComponent(fullGrantPath)}`;
  const summary = getPageDescription(grant.description, 260);
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
        name: grant.title,
        item: getAbsoluteUrl(previewPath),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <PublicNav />
      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          Grant opportunity preview
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">
          {grant.title}
        </h1>
        <p className="mt-2 text-lg text-text-secondary">Offered by {grant.funder}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Badge>{grant.category}</Badge>
          <Badge variant="neutral">
            <MapPin className="mr-1 h-3.5 w-3.5" />
            {grant.region}
          </Badge>
          <Badge variant="neutral">
            <CalendarDays className="mr-1 h-3.5 w-3.5" />
            {formatDeadline(grant)}
          </Badge>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_280px]">
          <Card padding="lg">
            <h2 className="text-xl font-semibold text-text">Opportunity summary</h2>
            <p className="mt-4 leading-7 text-text-secondary">{summary}</p>
            <p className="mt-5 text-sm text-text-muted">
              Sign in to review full eligibility requirements, application details,
              matching insights, and verified source links.
            </p>
          </Card>

          <Card padding="lg" className="h-fit">
            <p className="text-sm text-text-secondary">Potential award</p>
            <p className="mt-1 text-xl font-bold text-text">{formatAward(grant)}</p>
            <Link href={loginHref} className="mt-6 block">
              <Button className="w-full" size="lg">
                Sign in for full details
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="mt-3 text-center text-xs text-text-muted">
              A free Grantclient account is required.
            </p>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
