"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Role } from "@/generated/prisma/enums";
import { useServerAction } from "@/hooks/use-server-action";
import { applyFieldErrors } from "@/lib/forms";
import { PasswordInput } from "@/modules/auth/components/password-input";
import { useAuth } from "@/modules/auth/providers/auth-provider";
import { createUserAction, updateUserAction } from "../user.actions";
import { createUserSchema, editUserFormSchema, type UserFormValues } from "../user.schema";

const ROLE_OPTIONS = [
  { value: Role.USER, label: "User", description: "Can sign in and manage their own profile." },
  {
    value: Role.ADMIN,
    label: "Administrator",
    description: "Full access, including managing all users.",
  },
];

type UserFormProps =
  | { mode: "create"; onSuccess?: () => void; onCancel?: () => void }
  | {
      mode: "edit";
      userId: string;
      defaultValues: Omit<UserFormValues, "password">;
      onCancel?: () => void;
    };

/** Create / edit user form (react-hook-form + shared zod schema + server action). */
export function UserForm(props: UserFormProps) {
  const isEdit = props.mode === "edit";
  const { user: currentUser } = useAuth();
  const isSelf = isEdit && currentUser?.id === props.userId;
  const activeId = useId();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? editUserFormSchema : createUserSchema),
    defaultValues: isEdit
      ? { ...props.defaultValues, password: "" }
      : { name: "", email: "", password: "", role: Role.USER, isActive: true },
    mode: "onTouched",
  });
  const { register, control, handleSubmit, setError, reset, formState } = form;
  const { errors, isDirty } = formState;

  const onError = (error: { fieldErrors?: Record<string, string[]> }) =>
    applyFieldErrors(setError, error.fieldErrors);
  const create = useServerAction(createUserAction, {
    onSuccess: () => {
      reset();
      if (props.mode === "create") props.onSuccess?.();
    },
    onError,
  });
  const update = useServerAction(updateUserAction, {
    onSuccess: () => {
      reset({ ...form.getValues(), password: "" });
    },
    onError,
  });
  const isPending = create.isPending || update.isPending;

  const onSubmit = handleSubmit((values) => {
    if (props.mode === "create") void create.execute(values);
    else void update.execute({ id: props.userId, values });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Full name" error={errors.name?.message} required>
          {(field) => (
            <Input {...field} {...register("name")} autoComplete="name" disabled={isPending} />
          )}
        </FormField>
        <FormField label="Email" error={errors.email?.message} required>
          {(field) => (
            <Input
              {...field}
              {...register("email")}
              type="email"
              autoComplete="off"
              disabled={isPending}
            />
          )}
        </FormField>
      </div>

      <FormField
        label={isEdit ? "New password" : "Password"}
        description={
          isEdit
            ? "Leave blank to keep the current password. Changing it signs the user out everywhere."
            : "At least 8 characters with upper & lower case, a number and a symbol."
        }
        error={errors.password?.message}
        required={!isEdit}
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register("password")}
            autoComplete="new-password"
            disabled={isPending}
          />
        )}
      </FormField>

      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <RadioGroup
            legend="Role"
            name={field.name}
            options={ROLE_OPTIONS.map((o) => ({ ...o, disabled: isSelf || isPending }))}
            value={field.value}
            onValueChange={field.onChange}
            orientation="horizontal"
            error={errors.role?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
            <div className="grid gap-1">
              <span id={`${activeId}-label`} className="text-sm font-medium">
                Active account
              </span>
              <span id={`${activeId}-hint`} className="text-xs text-muted-foreground">
                Inactive users cannot sign in and existing sessions are revoked.
              </span>
            </div>
            <Switch
              aria-labelledby={`${activeId}-label`}
              aria-describedby={`${activeId}-hint`}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isSelf || isPending}
            />
          </div>
        )}
      />

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {props.onCancel ? (
          <Button variant="outline" onClick={props.onCancel} disabled={isPending}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={isPending} disabled={isEdit && !isDirty}>
          {isEdit ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}
