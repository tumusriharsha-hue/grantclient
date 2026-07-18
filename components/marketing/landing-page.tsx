import Link from "next/link";
import { FileText, PenLine, Search } from "lucide-react";
import { PublicFooter } from "./public-footer";
import { PublicNav } from "./public-nav";
import { TypedHeadline } from "./typed-headline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Grant Discovery",
    description: "Find grants matched to your mission in seconds",
  },
  {
    icon: PenLine,
    title: "Drafting Lab",
    description: "Use AI to draft applications in minutes, not hours",
  },
  {
    icon: FileText,
    title: "Application Tracker",
    description: "Track drafting, submitted, and funded applications in one place",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <PublicNav />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-70 [mask-image:linear-gradient(to_bottom,white_0%,white_68%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-surface)_74%)]" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-6xl flex-col items-center justify-center px-6 py-28 text-center md:min-h-[86vh] md:py-36">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-text md:text-5xl">
            <TypedHeadline />
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            AI-powered grant discovery and application builder. Spend less time
            searching, more time growing.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-bg px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-black md:text-4xl">
            Built for teams that need funding to move
          </h2>
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              hover
              padding="lg"
              className="flex min-h-72 flex-col items-start justify-center bg-surface px-8 py-10 text-left md:min-h-80"
            >
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-text">
                {feature.title}
              </h3>
              <p className="mt-4 max-w-xs text-sm leading-7 text-text-secondary">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
