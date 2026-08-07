import Link from "next/link";
import type { SVGProps } from "react";
import { Mail } from "lucide-react";
import { GrantclientLogo } from "@/components/brand/grantclient-logo";

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

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Features", href: "/#features" },
      { label: "Browse grants", href: "/grants" },
    ],
  },
  {
    title: "Organization",
    links: [
      { label: "About", href: "/about" },
      { label: "Grants", href: "/grants" },
    ],
  },
  {
    title: "Support",
    links: [
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
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1.8fr] lg:gap-20">
          <div>
            <Link href="/" className="inline-flex">
              <GrantclientLogo className="grantclient-logo-always-light w-[190px] brightness-0 invert" />
            </Link>
            <p className="mt-6 max-w-md text-sm leading-6 text-text-muted sm:text-base">
              AI-powered grant discovery and application tools for nonprofits.
              Find opportunities, understand fit, and keep applications moving.
            </p>
            <div className="mt-7 flex items-center gap-6">
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

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="text-sm font-semibold tracking-tight text-white">
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
        </div>

        <div className="mt-16 border-t border-slate-800 pt-7">
          <div className="flex flex-col gap-4 text-center text-sm font-medium text-text-muted sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p suppressHydrationWarning>
              © {new Date().getFullYear()} Grantclient. All rights reserved.
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
