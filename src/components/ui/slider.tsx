"use client";

import { cn } from "cn";
import { useId, type ComponentProps, type CSSProperties } from "react";
import { useControllableState } from "@/hooks/use-controllable-state";

type SliderProps = Omit<ComponentProps<"input">, "type" | "value" | "defaultValue" | "onChange"> & {
  label: string;
  value?: number | undefined;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Formats the visible value and `aria-valuetext`. */
  formatValue?: (value: number) => string;
  hideLabel?: boolean;
};

/**
 * Range slider built on native `<input type="range">` — keyboard, touch and
 * screen readers work out of the box. Track fill is driven by a CSS variable.
 */
export function Slider({
  label,
  value,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  formatValue = String,
  hideLabel,
  className,
  disabled,
  ...props
}: SliderProps) {
  const id = useId();
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const percent = ((current - min) / (max - min)) * 100;

  return (
    <div className={cn("grid gap-3", className)}>
      <div className={cn("flex items-center justify-between text-sm", hideLabel && "sr-only")}>
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <output htmlFor={id} className="text-muted-foreground tabular-nums">
          {formatValue(current)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        aria-valuetext={formatValue(current)}
        onChange={(event) => {
          setCurrent(Number(event.target.value));
        }}
        style={{ "--fill": `${percent}%` } as CSSProperties}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(to_right,var(--color-primary)_var(--fill),var(--color-subtle)_var(--fill))]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-surface [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95",
          "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-surface",
        )}
        {...props}
      />
    </div>
  );
}
