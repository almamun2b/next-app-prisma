"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";
import { applyFieldErrors } from "@/lib/forms";
import { updateProfileAction } from "../user.actions";
import { updateProfileSchema, type UpdateProfileInput } from "../user.schema";

export function ProfileForm({
  defaultValues,
  email,
}: {
  defaultValues: UpdateProfileInput;
  email: string;
}) {
  const { register, handleSubmit, setError, reset, formState } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
    mode: "onTouched",
  });
  const { execute, isPending } = useServerAction(updateProfileAction, {
    onSuccess: () => {
      reset(undefined, { keepValues: true });
    },
    onError: (error) => applyFieldErrors(setError, error.fieldErrors),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => void execute(values))}
      noValidate
      className="grid gap-5"
    >
      <FormField label="Full name" error={formState.errors.name?.message} required>
        {(field) => (
          <Input {...field} {...register("name")} autoComplete="name" disabled={isPending} />
        )}
      </FormField>
      <FormField label="Email" description="Contact an administrator to change your email address.">
        {(field) => <Input {...field} value={email} readOnly disabled />}
      </FormField>
      <div className="flex justify-end">
        <Button type="submit" loading={isPending} disabled={!formState.isDirty}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
