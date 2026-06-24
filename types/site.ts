export interface SiteMetadata {
  title: string;
  description: string;
}

export interface ExternalLink {
  href: string;
  label: string;
}

export interface CtaLink extends ExternalLink {
  variant: "primary" | "secondary";
  icon?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}
