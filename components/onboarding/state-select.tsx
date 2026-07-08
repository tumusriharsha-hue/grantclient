"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { US_STATES } from "@/lib/onboarding/us-states";
import { cn } from "@/lib/utils";

interface StateSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function StateSelect({
  value,
  onChange,
  disabled = false,
  error,
}: StateSelectProps) {
  const [query, setQuery] = useState("");

  const filteredStates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return US_STATES;

    return US_STATES.filter(
      (state) =>
        state.label.toLowerCase().includes(normalized) ||
        state.value.toLowerCase().includes(normalized),
    );
  }, [query]);

  const selectedLabel = US_STATES.find((state) => state.value === value)?.label;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text">State *</label>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={selectedLabel ?? "Search states..."}
        disabled={disabled}
        className={cn(
          "w-full rounded-md border border-border-hover bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10",
          error && "border-danger",
        )}
      />
      <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg">
        {filteredStates.map((state) => (
          <button
            key={state.value}
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(state.value);
              setQuery("");
            }}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
              value === state.value
                ? "bg-primary-light font-medium text-primary-hover"
                : "text-text-secondary hover:bg-primary-light/60 hover:text-text",
            )}
          >
            <span>{state.label}</span>
            <span className="flex items-center gap-2">
              <span className="text-xs text-text-muted">{state.value}</span>
              {value === state.value && <Check className="h-4 w-4 text-primary" />}
            </span>
          </button>
        ))}
        {filteredStates.length === 0 && (
          <p className="px-3 py-4 text-sm text-text-muted">No states found.</p>
        )}
      </div>
      {selectedLabel && (
        <p className="text-xs text-text-secondary">Selected: {selectedLabel}</p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
