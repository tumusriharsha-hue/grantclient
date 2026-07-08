import Image from "next/image";
import { cn } from "@/lib/utils";

interface GrantClientLogoProps {
  className?: string;
  priority?: boolean;
}

export function GrantClientLogo({ className, priority = false }: GrantClientLogoProps) {
  return (
    <span className={cn("grantclient-logo relative block w-[190px]", className)}>
      <Image
        src="/brand/grantclient-logo-transparent.png"
        alt="GrantClient"
        width={433}
        height={95}
        priority={priority}
        className="grantclient-logo-light h-auto w-full transition-opacity"
      />
      <Image
        src="/brand/grantclient-logo-dark.png"
        alt=""
        width={558}
        height={101}
        priority={priority}
        aria-hidden="true"
        className="grantclient-logo-dark absolute left-0 top-1/2 h-auto w-full -translate-y-1/2 opacity-0 transition-opacity"
      />
    </span>
  );
}
