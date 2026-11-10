import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { FieldErrors } from "@/lib/errors";

/**
 * Maps server-side field errors (from an ActionResult) onto react-hook-form
 * fields, focusing the first invalid one. Returns true if any were applied.
 */
export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: FieldErrors | undefined,
) {
  if (!fieldErrors) return false;
  const entries = Object.entries(fieldErrors);
  entries.forEach(([field, messages], index) => {
    setError(
      field as Path<T>,
      { type: "server", message: messages[0] ?? "Invalid value" },
      { shouldFocus: index === 0 },
    );
  });
  return entries.length > 0;
}
