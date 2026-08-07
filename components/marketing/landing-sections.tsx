import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CalendarClock,
  Check,
  FileSearch,
  Filter,
  PenLine,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  Button,
  Card,
  PageContainer,
  SectionHeading,
  WorkflowStepCard,
} from "@/components/ui";

const steps = [
  {
    number: "01",
    title: "Tell us about your nonprofit",
    description:
      "Add your mission, location, populations served, and funding goals once so Grantclient can understand what fits.",
  },
  {
    number: "02",
    title: "Review relevant opportunities",
    description:
      "Browse grants with eligibility, deadline, geography, and funding-range context kept visible.",
  },
  {
    number: "03",
    title: "Save, draft, and track",
    description:
      "Keep promising grants organized and move from discovery to an application draft without rebuilding your work.",
  },
];

const features = [
  {
    icon: Search,
    title: "Grant discovery",
    description: "Search current opportunities by title, mission area, keyword, or category.",
  },
  {
    icon: Sparkles,
    title: "Personalized matching",
    description: "See recommendations ranked against the organization profile you provide.",
  },
  {
    icon: Filter,
    title: "Eligibility filtering",
    description: "Narrow results by category, location, deadline, and organization fit.",
  },
  {
    icon: SlidersHorizontal,
    title: "Funding range matching",
    description: "Compare award ranges with the amount your organization plans to request.",
  },
  {
    icon: CalendarClock,
    title: "Deadline tracking",
    description: "Keep due dates visible while reviewing, saving, and preparing applications.",
  },
  {
    icon: Bookmark,
    title: "Saved opportunities",
    description: "Build a focused list of grants your team wants to pursue and revisit.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-bg py-20 sm:py-24 lg:py-32">
      <PageContainer size="xl">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-6 lg:auto-rows-fr">
          <div className="flex items-end lg:col-span-3 lg:col-start-1 lg:row-start-1">
            <SectionHeading
              eyebrow="A clearer funding workflow"
              title="Move from searching to applying in three focused steps"
              description="Grantclient keeps the information around each opportunity connected, so small teams can spend more time on mission-critical work."
            />
          </div>
          <WorkflowStepCard
            {...steps[0]}
            className="lg:col-span-3 lg:col-start-1 lg:row-start-2"
          />
          <WorkflowStepCard
            {...steps[1]}
            className="lg:col-span-3 lg:col-start-4 lg:row-start-1"
          />
          <WorkflowStepCard
            {...steps[2]}
            className="lg:col-span-3 lg:col-start-4 lg:row-start-2"
          />
        </div>
      </PageContainer>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-24 bg-surface py-20 sm:py-24 lg:py-32">
      <PageContainer size="xl">
        <SectionHeading
          eyebrow="Everything in one place"
          title="Practical tools for the full grant workflow"
          description="Find the right opportunities, understand why they fit, and keep the next action clear."
          className="mb-10 lg:mb-14"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} padding="lg" className="min-h-60 p-7 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-10 text-xl font-semibold tracking-[-0.02em] text-text">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
                {description}
              </p>
            </Card>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function WorkflowSection() {
  return (
    <section className="bg-surface py-20 sm:py-24 lg:py-32">
      <PageContainer size="xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              From opportunity to application
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-text sm:text-4xl">
              Carry the right context into every draft
            </h2>
            <p className="mt-5 text-base leading-7 text-text-secondary">
              Open a grant, review the fit, and start an application with the opportunity already connected. Your existing Grantclient drafting and tracking flows stay exactly where you expect them.
            </p>
            <Link href="/grants" className="mt-8 inline-flex">
              <Button variant="secondary">
                Explore grant opportunities
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-border bg-bg p-4 sm:p-6">
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-7">
              <div className="flex items-center gap-3 border-b border-border pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
                  <FileSearch className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">Opportunity review</p>
                  <p className="text-xs text-text-muted">Fit, eligibility, and deadline context</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Mission aligned", "Funding in range", "Deadline visible"].map((item) => (
                  <div key={item} className="rounded-xl bg-bg p-4">
                    <Check className="h-4 w-4 text-success" aria-hidden="true" />
                    <p className="mt-3 text-xs font-medium leading-5 text-text">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary-light/30 p-4">
                <div className="flex items-center gap-3">
                  <PenLine className="h-5 w-5 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-text">Drafting Lab</p>
                    <p className="text-xs text-text-secondary">Continue with this grant</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
