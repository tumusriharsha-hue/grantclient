import { TOTAL_ONBOARDING_STEPS } from "@/types/organization";
import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  step: number;
}

export function OnboardingProgress({ step }: OnboardingProgressProps) {
  const progress = (step / TOTAL_ONBOARDING_STEPS) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-text">
          Step {step} of {TOTAL_ONBOARDING_STEPS}
        </span>
        <span className="text-text-muted">{Math.round(progress)}% complete</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className={cn("h-full rounded-full bg-primary transition-all duration-300")}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
