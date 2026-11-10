"use client";

import { cn } from "cn";
import { useId, type ReactNode } from "react";

export type RadioOption<V extends string> = {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

type RadioGroupProps<V extends string> = {
  legend: ReactNode;
  name: string;
  options: RadioOption<V>[];
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  orientation?: "vertical" | "horizontal";
  hideLegend?: boolean;
  error?: string | undefined;
  className?: string;
};

/**
 * Native radio inputs grouped in a `<fieldset>` + `<legend>`; the browser
 * provides arrow-key navigation and roving focus.
 */
export function RadioGroup<V extends string>({
  legend,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  hideLegend,
  error,
  className,
}: RadioGroupProps<V>) {
  const baseId = useId();
  const errorId = error ? `${baseId}-error` : undefined;

  return (
    <fieldset className={cn("grid gap-3", className)} aria-describedby={errorId}>
      <legend className={cn("mb-1 text-sm font-medium", hideLegend && "sr-only")}>{legend}</legend>
      <div
        className={cn("flex gap-3", orientation === "vertical" ? "flex-col" : "flex-wrap gap-x-6")}
      >
        {options.map((option) => {
          const id = `${baseId}-${option.value}`;
          return (
            <div key={option.value} className="flex items-start gap-3">
              <input
                type="radio"
                id={id}
                name={name}
                value={option.value}
                disabled={option.disabled}
                {...(value !== undefined ? { checked: value === option.value } : {})}
                {...(defaultValue !== undefined
                  ? { defaultChecked: defaultValue === option.value }
                  : {})}
                onChange={() => onValueChange?.(option.value)}
                className={cn(
                  "peer mt-0.5 size-4.5 shrink-0 cursor-pointer appearance-none rounded-full border border-input bg-surface shadow-xs",
                  "transition-[border-color,border-width] duration-150 hover:border-muted-foreground",
                  "checked:border-[5px] checked:border-primary",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              />
              <div className="grid gap-1">
                <label
                  htmlFor={id}
                  className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
                >
                  {option.label}
                </label>
                {option.description ? (
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
