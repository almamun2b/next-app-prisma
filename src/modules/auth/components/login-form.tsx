"use client";

import { CircleAlert, Mail } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { loginFormAction, type LoginFormState } from "../auth.actions";
import { PasswordInput } from "./password-input";

/** Optional explicit destination; defaults to the `callbackUrl` of the current page. */
type LoginFormProps = { callbackUrl?: string | undefined };

/**
 * Progressive-enhancement login form: a native `<form action>` bound to a
 * Server Action via `useActionState`. Works before hydration / without JS,
 * uses native constraint validation on the client and the shared zod schema
 * on the server — keeping validation libraries out of this public page's JS.
 */
export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(
    loginFormAction,
    null,
  );
  const error = state && !state.ok ? state.error : undefined;
  const fieldErrors = error?.fieldErrors;
  const formError = error && !fieldErrors ? error.message : undefined;

  return (
    <form
      action={formAction}
      className="grid gap-5"
      aria-describedby={formError ? "login-error" : undefined}
    >
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}
      {formError ? (
        <p
          id="login-error"
          role="alert"
          className="flex animate-fade-in items-start gap-2 rounded-md border border-destructive/30 bg-danger-soft px-3 py-2.5 text-sm text-destructive"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {formError}
        </p>
      ) : null}

      <FormField label="Email" error={fieldErrors?.email?.[0]} required>
        {(field) => (
          <Input
            {...field}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            defaultValue={state?.email ?? ""}
            key={state?.email ?? "email"}
            startAdornment={<Mail />}
            readOnly={isPending}
          />
        )}
      </FormField>

      <FormField label="Password" error={fieldErrors?.password?.[0]} required>
        {(field) => (
          <PasswordInput
            {...field}
            name="password"
            required
            autoComplete="current-password"
            readOnly={isPending}
          />
        )}
      </FormField>

      <Button type="submit" size="lg" fullWidth loading={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
