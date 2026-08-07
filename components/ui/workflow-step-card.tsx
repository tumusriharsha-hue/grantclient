import { cn } from "@/lib/utils";

interface WorkflowStepCardProps extends React.HTMLAttributes<HTMLElement> {
  number: string;
  title: string;
  description: string;
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={cn("absolute h-6 w-6 text-primary", className)}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
}

function CornerPlusIcons() {
  return (
    <>
      <PlusIcon className="-left-3 -top-3" />
      <PlusIcon className="-right-3 -top-3" />
      <PlusIcon className="-bottom-3 -left-3" />
      <PlusIcon className="-bottom-3 -right-3" />
    </>
  );
}

export function WorkflowStepCard({
  number,
  title,
  description,
  className,
  ...props
}: WorkflowStepCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col justify-start rounded-lg border border-dashed border-border-hover bg-surface p-6 sm:min-h-60 sm:justify-between sm:p-8",
        className,
      )}
      {...props}
    >
      <CornerPlusIcons />
      <span className="relative z-10 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Step {number}
      </span>
      <div className="relative z-10 mt-8 max-w-xl space-y-2 sm:mt-16">
        <h3 className="text-xl font-bold tracking-[-0.02em] text-text sm:text-2xl">
          {title}
        </h3>
        <p className="text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">
          {description}
        </p>
      </div>
    </article>
  );
}
