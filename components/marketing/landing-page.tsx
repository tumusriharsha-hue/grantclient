import Link from "next/link";
import { FileText, PenLine, Search } from "lucide-react";
import { PublicNav } from "./public-nav";
import { TypedHeadline } from "./typed-headline";
import { GrantClientLogo } from "@/components/brand/grantclient-logo";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

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

      <section className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center md:py-28">
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
      </section>

      <section className="border-y border-border bg-bg py-10">
        <p className="text-center text-sm text-text-secondary">
          Trusted by 50+ youth nonprofits and community organizations
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} hover padding="lg">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription className="mt-2">{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-bg">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-text-secondary sm:flex-row">
          <div className="flex items-center gap-3">
            <GrantClientLogo className="w-[145px]" />
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Contact</span>
            <Link href="/grants" className="font-medium text-primary hover:underline">
              Browse grants
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
