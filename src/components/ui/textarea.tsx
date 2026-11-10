import { cn } from "cn";
import type { ComponentProps } from "react";
import { controlStyles } from "./input";

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn(controlStyles, "field-sizing-content min-h-20 py-2", className)}
      {...props}
    />
  );
}
