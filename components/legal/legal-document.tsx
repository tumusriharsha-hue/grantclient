import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicNav } from "@/components/marketing/public-nav";

interface LegalSection {
  title: string;
  body: string[];
}

interface LegalDocumentProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalDocument({
  title,
  lastUpdated,
  intro,
  sections,
}: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-bg">
      <PublicNav showSignIn />
      <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <h1 className="text-3xl font-bold text-text">{title}</h1>
        <p className="mt-2 text-sm text-text-muted">Last updated: {lastUpdated}</p>
        <p className="mt-6 leading-relaxed text-text-secondary">{intro}</p>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-text">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-secondary">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-border pt-6 text-sm text-text-muted">
          Questions? Contact us at{" "}
          <a href="mailto:support@grantclient.com" className="text-primary hover:underline">
            support@grantclient.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
