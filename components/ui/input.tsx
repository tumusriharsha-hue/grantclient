"use client";

import { createPortal } from "react-dom";
import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "h-11 w-full rounded-md border border-border-hover bg-surface px-3 py-2.5 text-sm leading-6 text-text placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10 focus-visible:!outline-none",
          error && "border-danger focus:border-danger focus:ring-danger/10",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full resize-y rounded-md border border-border-hover bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10 focus-visible:!outline-none",
          error && "border-danger focus:border-danger focus:ring-danger/10",
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : (
        hint && <p className="text-xs text-text-muted">{hint}</p>
      )}
    </div>
  );
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    options,
    error,
    className,
    id,
    value,
    defaultValue,
    onChange,
    disabled,
    name,
    onBlur,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-") ?? generatedId;
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(
    String(value ?? defaultValue ?? options[0]?.value ?? ""),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | null>(null);
  const selectedValue = String(value ?? internalValue);
  const selectedOption = options.find((option) => option.value === selectedValue);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setMenuStyle({
        position: "fixed",
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
        zIndex: 50,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !containerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSelect(nextValue: string) {
    if (disabled) return;

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.({
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
    } as React.ChangeEvent<HTMLSelectElement>);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {label && (
        <label id={`${inputId}-label`} htmlFor={inputId} className="block text-xs font-semibold text-text-secondary">
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={inputId}
        name={name}
        value={selectedValue}
        disabled={disabled}
        required={required}
        onBlur={onBlur}
        onChange={() => {}}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        ref={triggerRef}
        type="button"
        aria-labelledby={label ? `${inputId}-label` : undefined}
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-md border border-border bg-bg px-3 py-2.5 text-left text-sm font-medium leading-6 text-text shadow-sm transition-colors hover:border-border-hover hover:bg-surface focus:border-primary focus:bg-surface focus:outline-none focus:ring-[3px] focus:ring-primary/10 disabled:pointer-events-none disabled:opacity-60",
          error && "border-danger focus:border-danger focus:ring-danger/10",
          className,
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selectedOption?.label ?? "Select"}</span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface text-primary">
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <>
          {menuStyle &&
            createPortal(
              <div
                ref={menuRef}
                role="listbox"
                aria-labelledby={label ? `${inputId}-label` : undefined}
                style={menuStyle}
                className="max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-lg"
              >
                {options.map((option) => {
                  const selected = option.value === selectedValue;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        selected
                          ? "bg-primary-light text-primary-hover hover:bg-primary-light hover:text-primary-hover"
                          : "text-text-secondary hover:bg-primary-light/60 hover:text-text",
                      )}
                      onClick={() => handleSelect(option.value)}
                    >
                      <span className="truncate">{option.label}</span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                    </button>
                  );
                })}
              </div>,
              document.body,
            )}
        </>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
});
