"use client";

import { cn } from "cn";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; title: string; description?: string | undefined; variant: ToastVariant };
type ToastInput = Omit<Toast, "id" | "variant"> & { variant?: ToastVariant };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const DURATION_MS = 5000;
const ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const;

let nextId = 0;

/** Provides `useToast()` and renders the live region (polite / assertive for errors). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ variant = "info", ...input }: ToastInput) => {
      const id = ++nextId;
      setToasts((list) => [...list.slice(-3), { id, variant, ...input }]);
      setTimeout(() => {
        dismiss(id);
      }, DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      <section
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
      >
        <ol
          className="flex w-full flex-col items-end gap-2"
          aria-live="polite"
          aria-relevant="additions"
        >
          {toasts.map((t) => {
            const Icon = ICONS[t.variant];
            return (
              <li
                key={t.id}
                className="pointer-events-auto flex w-full animate-toast-in items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg sm:w-96"
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 size-5 shrink-0",
                    t.variant === "success" && "text-success",
                    t.variant === "error" && "text-destructive",
                    t.variant === "info" && "text-primary",
                  )}
                />
                <div className="grid flex-1 gap-1">
                  <p className="text-sm font-semibold">{t.title}</p>
                  {t.description ? (
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => {
                    dismiss(t.id);
                  }}
                  className="-m-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </ToastContext>
  );
}

export function useToast() {
  const ctx = use(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
