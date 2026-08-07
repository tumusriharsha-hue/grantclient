import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicFooter } from "./public-footer";
import { PublicNav } from "./public-nav";
import { Button } from "@/components/ui/button";
import { WorkspacePreview } from "./workspace-preview";
import {
  FeaturesSection,
  HowItWorksSection,
  SmallNonprofitSection,
  WorkflowSection,
} from "./landing-sections";

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-surface">
      <PublicNav />

      <main>
      <section className="relative overflow-hidden bg-surface">
        <div className="pointer-events-none absolute left-1/2 top-12 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary-light/55 blur-3xl" />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 pb-16 pt-24 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/80 px-4 py-2 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Funding tools built for nonprofits
          </div>
          <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-text sm:text-5xl lg:text-7xl lg:leading-[1.04]">
            Find grants. Draft faster. Track everything.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
            Grantclient is a free AI-powered grant discovery and application
            builder for nonprofits. Spend less time searching, more time growing.
          </p>
          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/grants">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Browse grants
              </Button>
            </Link>
          </div>
          <p className="mt-5 text-xs text-text-muted">
            Create an account to save grants and build applications.
          </p>
        </div>
      </section>

      <WorkspacePreview />
      <HowItWorksSection />
      <FeaturesSection />
      <SmallNonprofitSection />
      <WorkflowSection />
      </main>

      <PublicFooter />
    </div>
  );
}
