import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-md border border-border-hover bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10",
          className,
        )}
        {...props}
      />
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({ label, hint, className, id, ...props }: TextareaProps) {
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
          "w-full resize-y rounded-md border border-border-hover bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted transition-colors focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10",
          className,
        )}
        {...props}
      />
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full rounded-md border border-border-hover bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/10",
          className,
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
