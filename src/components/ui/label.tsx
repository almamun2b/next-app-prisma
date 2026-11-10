import { cn } from "cn";
import type { ComponentProps } from "react";

type LabelProps = ComponentProps<"label"> & { required?: boolean };

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm leading-none font-medium text-foreground select-none peer-disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  );
}
