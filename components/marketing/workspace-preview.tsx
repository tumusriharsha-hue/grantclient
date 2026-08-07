import {
  Bookmark,
  FileText,
  LayoutDashboard,
  PenLine,
  Search,
} from "lucide-react";
import { GrantclientLogo } from "@/components/brand/grantclient-logo";
import { cn } from "@/lib/utils";

const previewNav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Grant Finder", icon: Search },
  { label: "Saved Grants", icon: Bookmark },
  { label: "My Applications", icon: FileText },
  { label: "Drafting Lab", icon: PenLine },
];

export function WorkspacePreview() {
  return (
    <section className="bg-surface pb-20 pt-4 sm:pb-24 lg:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_24px_80px_rgba(6,40,61,0.10)]">
          <div className="flex h-10 items-center gap-2 border-b border-border px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="ml-2 text-xs text-text-muted">Grantclient workspace</span>
          </div>
          <div className="flex min-h-[430px] sm:min-h-[500px]">
              <aside className="hidden w-52 shrink-0 border-r border-border bg-bg p-4 sm:block">
                <div className="mb-7 flex h-8 items-center overflow-hidden px-1">
                  <GrantclientLogo className="max-w-none w-[150px]" />
                </div>
                <nav className="space-y-1" aria-label="Workspace preview navigation">
                  {previewNav.map(({ label, icon: Icon, active }) => (
                    <div
                      key={label}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium",
                        active
                          ? "bg-primary-light/70 text-primary"
                          : "text-text-secondary",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {label}
                    </div>
                  ))}
                </nav>
              </aside>

              <div className="min-w-0 flex-1 bg-bg/40 p-5 sm:p-8 lg:p-10">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                      Dashboard
                    </p>
                    <p className="mt-1 text-xl font-semibold tracking-tight text-text sm:text-2xl">
                      Your next opportunity is here.
                    </p>
                  </div>
                  <div className="hidden h-8 w-8 rounded-full bg-primary-light sm:block" />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="h-2 w-20 rounded-full bg-primary/70" />
                    <p className="mt-4 text-sm font-medium text-text">Grant Discovery</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                      Matches based on your mission and profile.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <div className="h-2 w-14 rounded-full bg-success/70" />
                    <p className="mt-4 text-sm font-medium text-text">Application progress</p>
                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                      Draft, submit, and track every next step.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text">Top grants for you</p>
                    <div className="h-2 w-16 rounded-full bg-border" />
                  </div>
                  <div className="mt-5 grid gap-3">
                    {["Personalized mission match", "Eligibility and location fit", "Funding range alignment"].map(
                      (label, index) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 rounded-xl bg-bg px-4 py-3"
                        >
                          <span className="text-xs font-medium text-text-secondary sm:text-sm">
                            {label}
                          </span>
                          <span
                            className={cn(
                              "h-2 rounded-full bg-primary/70",
                              index === 0 ? "w-16" : index === 1 ? "w-12" : "w-10",
                            )}
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
