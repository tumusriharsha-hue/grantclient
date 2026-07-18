"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";
import { MISSION_CATEGORIES, ORGANIZATION_TYPES } from "@/types/organization";

const focusAreas = MISSION_CATEGORIES;

const orgTypes = ORGANIZATION_TYPES.map((type) => ({ value: type, label: type }));

const fundingSizes = [
  { value: "small", label: "Small ($5k – $50k)" },
  { value: "medium", label: "Medium ($50k – $250k)" },
  { value: "large", label: "Large ($250k – $1M+)" },
  { value: "any", label: "Any size" },
];

export function SetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [fundingSize, setFundingSize] = useState("medium");

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  function toggleFocus(area: string) {
    setSelectedFocus((prev) => {
      if (prev.includes(area)) return prev.filter((a) => a !== area);
      if (prev.length >= 3) return prev;
      return [...prev, area];
    });
  }

  function finish() {
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-text-secondary">
            <span>Step {step} of {totalSteps}</span>
            <button
              type="button"
              onClick={finish}
              className="text-text-muted hover:text-primary"
            >
              Skip setup
            </button>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-text">
                  Tell us about your organization
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  We&apos;ll use this to personalize grant recommendations.
                </p>
              </div>
              <Input label="Organization name" placeholder="Urban Reach Initiative" />
              <Select
                label="Organization type"
                options={orgTypes}
                defaultValue="501(c)(3) Nonprofit"
              />
              <Input label="Location" placeholder="Brooklyn, NY" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-text">
                  What does your organization focus on?
                </h1>
                <p className="mt-1 text-sm text-text-secondary">
                  Select up to 3 focus areas to personalize recommendations.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {focusAreas.map((area) => (
                  <label
                    key={area}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors",
                      selectedFocus.includes(area)
                        ? "border-primary bg-primary-light/40 text-primary"
                        : "border-border text-text-secondary hover:border-border-hover",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFocus.includes(area)}
                      onChange={() => toggleFocus(area)}
                      className="rounded"
                    />
                    {area}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-text">
                  What size grants are you looking for?
                </h1>
              </div>
              <div className="space-y-2">
                {fundingSizes.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors",
                      fundingSize === option.value
                        ? "border-primary bg-primary-light/40"
                        : "border-border hover:border-border-hover",
                    )}
                  >
                    <input
                      type="radio"
                      name="funding"
                      value={option.value}
                      checked={fundingSize === option.value}
                      onChange={() => setFundingSize(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button
              variant="secondary"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={() => setStep((s) => s + 1)}>Next</Button>
            ) : (
              <Button onClick={finish}>Done</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
