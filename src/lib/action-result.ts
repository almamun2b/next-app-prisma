import type { ErrorCode, FieldErrors } from "@/lib/errors/app-error";

/** Serializable result every server action returns to the client. */
export type ActionResult<T = void> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: FieldErrors } };

export type ActionError = Extract<ActionResult, { ok: false }>["error"];
