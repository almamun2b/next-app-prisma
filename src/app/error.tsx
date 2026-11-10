"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Route-level error boundary. Never shows raw error details to users. */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="grid min-h-[60dvh] place-items-center px-4 py-16 text-center">
      <div className="grid max-w-md justify-items-center gap-4">
        <p className="text-sm font-semibold text-destructive">Error</p>
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Try again — if the problem persists, contact support
          {error.digest ? (
            <>
              {" "}
              with reference <code className="font-mono text-xs">{error.digest}</code>
            </>
          ) : null}
          .
        </p>
        <Button onClick={reset} variant="outline">
          <RotateCcw aria-hidden="true" /> Try again
        </Button>
      </div>
    </main>
  );
}
