import Image from "next/image";
import type { CtaLink } from "@/types";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  link: CtaLink;
}

export function CtaButton({ link }: CtaButtonProps) {
  const isPrimary = link.variant === "primary";

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-medium transition-colors md:w-[158px]",
        isPrimary
          ? "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          : "border border-solid border-black/[.08] hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]",
      )}
    >
      {link.icon && (
        <Image
          className="dark:invert"
          src={link.icon.src}
          alt={link.icon.alt}
          width={link.icon.width}
          height={link.icon.height}
        />
      )}
      {link.label}
    </a>
  );
}
