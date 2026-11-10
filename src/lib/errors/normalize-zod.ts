import { z } from "@/lib/zod";
import { AppError, type FieldErrors } from "./app-error";

/** Converts a ZodError into a 422 AppError with per-field messages. */
export function normalizeZodError(error: z.ZodError): AppError {
  const fieldErrors: FieldErrors = {};
  const formErrors: string[] = [];

  for (const issue of error.issues) {
    const path = issue.path.map(String).join(".");
    if (!path) {
      formErrors.push(issue.message);
      continue;
    }
    (fieldErrors[path] ??= []).push(issue.message);
  }

  const message = formErrors[0] ?? "Please correct the highlighted fields";
  return AppError.validation(message, fieldErrors);
}

export function isZodError(error: unknown): error is z.ZodError {
  return error instanceof z.ZodError;
}
