"use client";

import { cn } from "cn";
import { useId, type ReactNode } from "react";
import { Label } from "./label";

/** Props a FormField hands to its control for correct a11y wiring. */
export type FieldControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
  "aria-required": boolean | undefined;
};

type FormFieldProps = {
  label: ReactNode;
  description?: ReactNode;
  error?: string | undefined;
  required?: boolean;
  className?: string;
  /** Visually hide the label (it is still announced). */
  hideLabel?: boolean;
  children: (control: FieldControlProps) => ReactNode;
};

/**
 * Label + control + description + error, wired with `htmlFor`,
 * `aria-describedby` and `aria-invalid`. Works with react-hook-form:
 *
 * ```tsx
 * <FormField label="Email" error={errors.email?.message}>
 *   {(field) => <Input {...field} {...register("email")} />}
 * </FormField>
 * ```
 */
export function FormField({
  label,
  description,
  error,
  required,
  className,
  hideLabel,
  children,
}: FormFieldProps) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const ids = [descriptionId, errorId].filter(Boolean).join(" ");
  const describedBy = ids.length > 0 ? ids : undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} required={required} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </Label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required ? true : undefined,
      })}
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="animate-fade-in text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
