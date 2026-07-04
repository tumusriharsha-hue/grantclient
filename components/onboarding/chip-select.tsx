"use client";

import { cn } from "@/lib/utils";

interface ChipSelectProps<T extends string> {
  options: readonly T[];
  value: T[];
  onChange: (value: T[]) => void;
  disabled?: boolean;
  error?: string;
}

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  error,
}: ChipSelectProps<T>) {
  function toggle(option: T) {
    if (disabled) return;

    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              disabled={disabled}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-text",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
