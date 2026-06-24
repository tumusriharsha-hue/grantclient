import type { ExternalLink } from "@/types";

interface ExternalLinkProps extends ExternalLink {
  className?: string;
}

export function ExternalLink({ href, label, className }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
    </a>
  );
}
