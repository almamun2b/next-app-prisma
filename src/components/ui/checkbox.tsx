import { cn } from "cn";
import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label?: ReactNode;
  description?: ReactNode;
};

/** Native checkbox (full keyboard + form support) with custom styling. */
export function Checkbox({ className, label, description, id, disabled, ...props }: CheckboxProps) {
  const box = (
    <span className="relative inline-flex size-4.5 shrink-0">
      <input
        type="checkbox"
        id={id}
        disabled={disabled}
        className={cn(
          "peer size-full cursor-pointer appearance-none rounded-[5px] border border-input bg-surface shadow-xs",
          "transition-colors duration-150 hover:border-muted-foreground",
          "checked:border-primary checked:bg-primary",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden="true"
        strokeWidth={3.5}
        className="pointer-events-none absolute inset-0 m-auto size-3 text-primary-foreground opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
      />
    </span>
  );
  if (!label) return box;

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex">{box}</span>
      <div className="grid gap-1">
        <label
          htmlFor={id}
          className={cn(
            "cursor-pointer text-sm leading-none font-medium",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {label}
        </label>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}
