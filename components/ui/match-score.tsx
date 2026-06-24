import { cn } from "@/lib/utils";

interface MatchScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { box: "h-14 w-14", text: "text-lg" },
  md: { box: "h-20 w-20", text: "text-2xl" },
  lg: { box: "h-24 w-24", text: "text-3xl" },
};

export function MatchScore({ score, size = "md", className }: MatchScoreProps) {
  const isHigh = score >= 85;
  const isMid = score >= 70;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-md",
        sizeMap[size].box,
        sizeMap[size].text,
        isHigh
          ? "bg-gradient-to-br from-success to-emerald-600 shadow-success/30"
          : isMid
            ? "bg-gradient-to-br from-primary to-primary-hover shadow-primary/20"
            : "bg-gradient-to-br from-text-secondary to-gray-500",
        className,
      )}
      aria-label={`${score}% match`}
    >
      {score}%
    </div>
  );
}

export function getDeadlineVariant(
  daysLeft: number,
): "danger" | "warning" | "neutral" {
  if (daysLeft < 7) return "danger";
  if (daysLeft < 14) return "warning";
  return "neutral";
}

export function getDeadlineLabel(daysLeft: number): string {
  if (daysLeft === 0) return "Due today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}
