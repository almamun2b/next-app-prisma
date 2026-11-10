"use client";

import { useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import type { ActionError, ActionResult } from "@/lib/action-result";

type Options<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: ActionError) => void;
  /** Show the action's `message` (or this text) as a success toast. */
  successToast?: string | boolean;
  /** Show the error message as a toast (default true). */
  errorToast?: boolean;
};

/**
 * Runs a Server Action inside a transition and handles the ActionResult:
 * pending state, success/error toasts and callbacks. This is how client
 * components perform mutations — never with `fetch`.
 */
export function useServerAction<I, T>(
  action: (input: I) => Promise<ActionResult<T>>,
  { onSuccess, onError, successToast = true, errorToast = true }: Options<T> = {},
) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  function execute(input: I) {
    return new Promise<ActionResult<T> | undefined>((resolve) => {
      startTransition(async () => {
        // `undefined` when the action redirected (navigation in progress).
        const result = (await action(input)) as ActionResult<T> | undefined;
        if (!result) {
          resolve(undefined);
          return;
        }
        if (result.ok) {
          const title = typeof successToast === "string" ? successToast : result.message;
          if (successToast && title) toast({ title, variant: "success" });
          onSuccess?.(result.data);
        } else {
          if (errorToast && !result.error.fieldErrors) {
            toast({ title: result.error.message, variant: "error" });
          }
          onError?.(result.error);
        }
        resolve(result);
      });
    });
  }

  return { execute, isPending } as const;
}
