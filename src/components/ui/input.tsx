import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

/** Shared control styles for text inputs, textareas and native selects. */
export const controlStyles = cn(
  "w-full min-w-0 rounded-md border border-input bg-surface px-3 text-sm text-foreground shadow-xs",
  "transition-[border-color,box-shadow] duration-150 placeholder:text-muted-foreground",
  "hover:border-muted-foreground/60",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 focus-visible:outline-none",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
  "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20",
);

export type InputProps = ComponentProps<"input"> & {
  /** Icon or text rendered inside the start of the field (decorative). */
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export function Input({
  className,
  startAdornment,
  endAdornment,
  type = "text",
  ...props
}: InputProps) {
  const input = (
    <input
      type={type}
      className={cn(
        controlStyles,
        "h-10 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        startAdornment ? "pl-9" : null,
        endAdornment ? "pr-10" : null,
        className,
      )}
      {...props}
    />
  );
  if (!startAdornment && !endAdornment) return input;

  return (
    <div className="relative">
      {startAdornment ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground [&_svg]:size-4">
          {startAdornment}
        </span>
      ) : null}
      {input}
      {endAdornment ? (
        <span className="absolute inset-y-0 right-1 flex items-center">{endAdornment}</span>
      ) : null}
    </div>
  );
}
