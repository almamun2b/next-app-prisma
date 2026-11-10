import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import type { ActionResult } from "@/lib/action-result";
import { AppError, handleError } from "@/lib/errors";
import { getSessionUser, isAdmin } from "@/modules/auth/auth.guard";
import type { SessionUser } from "@/modules/auth/auth.types";

type Access = "public" | "user" | "admin";
type ActionContext<A extends Access> = {
  user: A extends "public" ? SessionUser | null : SessionUser;
};

type ActionConfig<S extends z.ZodType, R, A extends Access> = {
  schema: S;
  /** Who may call the action. Defaults to `"user"` (any signed-in user). */
  access?: A;
  successMessage?: string;
  handler: (input: z.output<S>, ctx: ActionContext<A>) => Promise<R>;
};

/**
 * Global wrapper for Server Actions: authenticates, authorizes, validates the
 * input with zod, runs the handler and normalizes ANY error into an
 * `ActionResult`. Framework control-flow errors (redirect, notFound) are
 * re-thrown so Next.js can handle them.
 */
export function createAction<S extends z.ZodType, R, A extends Access = "user">(
  config: ActionConfig<S, R, A>,
) {
  const access: Access = config.access ?? "user";

  return async (input: z.input<S>): Promise<ActionResult<R>> => {
    try {
      const user = await getSessionUser();
      if (access !== "public" && !user) throw AppError.unauthorized();
      if (access === "admin" && !isAdmin(user)) throw AppError.forbidden();

      const parsed = (await config.schema.parseAsync(input)) as z.output<S>;
      const data = await config.handler(parsed, { user } as ActionContext<A>);
      return {
        ok: true,
        data,
        ...(config.successMessage ? { message: config.successMessage } : {}),
      };
    } catch (error) {
      unstable_rethrow(error);
      const appError = handleError(error, { source: "server-action" });
      const fieldErrors = appError.details?.fieldErrors;
      return {
        ok: false,
        error: {
          code: appError.code,
          message: appError.message,
          ...(fieldErrors ? { fieldErrors } : {}),
        },
      };
    }
  };
}

export type { ActionResult };
