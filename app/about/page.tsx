import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicNav } from "@/components/marketing";

export const metadata: Metadata = {
  title: "About Grantclient",
  description:
    "Learn how Grantclient helps nonprofits find funding opportunities, prepare grant applications, and track submissions.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Grantclient",
    description:
      "Grant discovery and application tools designed to help nonprofits spend less time searching and more time growing.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight text-text">
          About Grantclient
        </h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-text-secondary">
          <p>
            Grantclient is a free grant discovery and application platform built
            for nonprofits. It brings funding research, application drafting, and
            submission tracking into one workspace.
          </p>
          <p>
            Organizations can browse current grant opportunities, save relevant
            funding, maintain an organization profile, prepare application drafts,
            and track their progress. AI-assisted features help with research and
            drafting, while users remain responsible for reviewing information and
            verifying requirements with each funder.
          </p>
          <p>
            Our goal is simple: help nonprofit teams spend less time searching for
            funding and more time serving their communities.
          </p>
          <p>
            Questions or feedback? Email{" "}
            <a
              href="mailto:support@grantclient.com"
              className="font-medium text-primary hover:underline"
            >
              support@grantclient.com
            </a>
            , or start by exploring the{" "}
            <Link href="/grants" className="font-medium text-primary hover:underline">
              Grant Finder
            </Link>
            .
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
