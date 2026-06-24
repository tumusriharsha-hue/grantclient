import type { CtaLink, ExternalLink, SiteMetadata } from "@/types";

export const siteMetadata: SiteMetadata = {
  title: "Grant Client",
  description: "Discover, manage, and track grant opportunities.",
};

export const homeContent = {
  heading: "To get started, edit the page.tsx file.",
  description:
    "Looking for a starting point or more instructions? Head over to Templates or the Learning center.",
} as const;

export const homeInlineLinks: ExternalLink[] = [
  {
    href: "https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
    label: "Templates",
  },
  {
    href: "https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
    label: "Learning",
  },
];

export const homeCtaLinks: CtaLink[] = [
  {
    href: "https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
    label: "Deploy Now",
    variant: "primary",
    icon: {
      src: "/vercel.svg",
      alt: "Vercel logomark",
      width: 16,
      height: 16,
    },
  },
  {
    href: "https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app",
    label: "Documentation",
    variant: "secondary",
  },
];
