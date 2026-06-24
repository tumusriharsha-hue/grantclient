import { homeCtaLinks } from "@/data";
import { CtaButton } from "@/components/ui/cta-button";

export function CtaSection() {
  return (
    <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
      {homeCtaLinks.map((link) => (
        <CtaButton key={link.href} link={link} />
      ))}
    </div>
  );
}
