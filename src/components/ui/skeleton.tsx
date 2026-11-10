import { cn } from "cn";
import type { ComponentProps } from "react";

/** Placeholder block shown while streamed content loads. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-subtle motion-reduce:animate-none", className)}
      {...props}
    />
  );
}
