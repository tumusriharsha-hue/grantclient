import Link from "next/link";
import type { SVGProps } from "react";
import { Mail } from "lucide-react";
import { GrantClientLogo } from "@/components/brand/grantclient-logo";

type FooterLink = {
  label: string;
  href: string;
};

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6.5 10v8" />
      <path d="M6.5 6v.01" />
      <path d="M11 18v-8" />
      <path d="M11 13.5a3.5 3.5 0 0 1 7 0V18" />
    </svg>
  );
}

const footerColumns = [
  {
    title: "Organization",
    links: [
      { label: "About Us", href: "/" },
      { label: "Grants", href: "/grants" },
      { label: "Marketplace", href: "/browse" },
      { label: "Resources", href: "/documents" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Partners", href: "mailto:partners@grantclient.com" },
      { label: "Support Us", href: "mailto:support@grantclient.com" },
      { label: "Contact", href: "mailto:support@grantclient.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/grantclient",
    icon: InstagramIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/grantclient",
    icon: LinkedInIcon,
  },
  {
    label: "Email",
    href: "mailto:support@grantclient.com",
    icon: Mail,
  },
];

function FooterLink({ href, label }: FooterLink) {
  const className = "text-sm font-medium text-text-muted transition hover:text-white";

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-flex justify-center">
            <GrantClientLogo className="w-[190px] brightness-0 invert" />
          </Link>
          <p className="mt-7 max-w-3xl text-sm font-medium text-text-muted sm:text-base">
            AI-powered grant discovery and application builder for nonprofits.
            Find grants, apply faster, get funded.
          </p>
          <div className="mt-7 flex items-center justify-center gap-7">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-text-muted transition hover:text-white"
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "noreferrer" : undefined}
              >
                <social.icon className="h-6 w-6 stroke-[2.1]" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-10 text-center sm:grid-cols-3 sm:text-left">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-base font-semibold tracking-tight text-white">
                {column.title}
              </h2>
              <ul className="mt-5 space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-slate-800 pt-7">
          <div className="flex flex-col gap-4 text-center text-sm font-medium text-text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p suppressHydrationWarning>
              © {new Date().getFullYear()} GrantClient. All rights reserved.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/privacy" className="transition hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
