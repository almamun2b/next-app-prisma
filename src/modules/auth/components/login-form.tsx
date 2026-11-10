"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { applyFieldErrors } from "@/lib/forms";
import { loginAction } from "../auth.actions";
import { loginSchema, type LoginInput } from "../auth.schema";
import { PasswordInput } from "./password-input";

export function LoginForm({
  callbackUrl,
  notice,
}: {
  callbackUrl?: string | undefined;
  notice?: string | undefined;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      // Resolves only on failure — success redirects on the server.
      const result = (await loginAction(values, callbackUrl)) as
        Awaited<ReturnType<typeof loginAction>> | undefined;
      if (!result || result.ok) return;
      if (!applyFieldErrors(setError, result.error.fieldErrors)) setFormError(result.error.message);
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-5"
      aria-describedby={formError ? "login-error" : undefined}
    >
      {notice && !formError ? (
        <p
          role="status"
          className="rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-secondary-foreground"
        >
          {notice}
        </p>
      ) : null}
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

      <FormField label="Email" error={errors.email?.message} required>
        {(field) => (
          <Input
            {...field}
            {...register("email")}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@company.com"
            startAdornment={<Mail />}
            disabled={isPending}
          />
        )}
      </FormField>

      <FormField label="Password" error={errors.password?.message} required>
        {(field) => (
          <PasswordInput
            {...field}
            {...register("password")}
            autoComplete="current-password"
            disabled={isPending}
          />
        )}
      </FormField>

      <Button type="submit" size="lg" fullWidth loading={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
