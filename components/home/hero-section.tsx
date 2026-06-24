import { homeContent, homeInlineLinks } from "@/data";
import type { ExternalLink } from "@/types";

function InlineLink({ href, label }: ExternalLink) {
  return (
    <a
      href={href}
      className="font-medium text-zinc-950 dark:text-zinc-50"
    >
      {label}
    </a>
  );
}

export function HeroSection() {
  const [templatesLink, learningLink] = homeInlineLinks;

  return (
    <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
      <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        {homeContent.heading}
      </h1>
      <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Looking for a starting point or more instructions? Head over to{" "}
        <InlineLink {...templatesLink} /> or the{" "}
        <InlineLink {...learningLink} /> center.
      </p>
    </div>
  );
}
