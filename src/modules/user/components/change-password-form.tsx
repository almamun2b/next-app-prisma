"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useServerAction } from "@/hooks/use-server-action";
import { applyFieldErrors } from "@/lib/forms";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { changePasswordAction } from "../user.actions";
import { changePasswordSchema, type ChangePasswordInput } from "../user.schema";

const FIELDS = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
] as const;

/** Changing the password revokes all sessions; the action redirects to /login. */
export function ChangePasswordForm() {
  const { register, handleSubmit, setError, formState } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });
  const { execute, isPending } = useServerAction(changePasswordAction, {
    onError: (error) => applyFieldErrors(setError, error.fieldErrors),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => void execute(values))}
      noValidate
      className="grid gap-5"
    >
      {FIELDS.map(({ name, label, autoComplete }) => (
        <FormField
          key={name}
          label={label}
          required
          error={formState.errors[name]?.message}
          description={
            name === "newPassword"
              ? "8+ characters with upper & lower case, a number and a symbol."
              : undefined
          }
        >
          {(field) => (
            <PasswordInput
              {...field}
              {...register(name)}
              autoComplete={autoComplete}
              disabled={isPending}
            />
          )}
        </FormField>
      ))}
      <div className="flex justify-end">
        <Button type="submit" loading={isPending}>
          Update password
        </Button>
      </div>
    </form>
  );
}
