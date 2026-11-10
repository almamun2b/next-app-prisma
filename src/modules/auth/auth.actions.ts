"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { unstable_rethrow } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { siteConfig } from "@/config/site";
import { ErrorCode } from "@/lib/errors";
import { normalizeZodError } from "@/lib/errors/normalize-zod";
import type { ActionResult } from "@/lib/action-result";
import { LOGIN_ERROR_MESSAGES } from "./auth.errors";
import { loginSchema, safeCallbackUrl, type LoginInput } from "./auth.schema";

/**
 * Credentials sign-in. On success Auth.js sets the session cookie and
 * redirects (thrown NEXT_REDIRECT, re-thrown below); on failure a typed
 * ActionResult is returned for the form to display.
 */
export async function loginAction(input: LoginInput, callbackUrl?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    const err = normalizeZodError(parsed.error);
    return {
      ok: false,
      error: { code: err.code, message: err.message, fieldErrors: err.details?.fieldErrors ?? {} },
    };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeCallbackUrl(callbackUrl, "/dashboard", siteConfig.url),
    });
    return { ok: true, data: undefined };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof CredentialsSignin) {
      const message = LOGIN_ERROR_MESSAGES[error.code] ?? LOGIN_ERROR_MESSAGES.invalid_credentials;
      const code =
        error.code === "rate_limited" ? ErrorCode.TOO_MANY_REQUESTS : ErrorCode.UNAUTHORIZED;
      return { ok: false, error: { code, message: message ?? "Sign-in failed." } };
    }
    if (error instanceof AuthError) {
      return { ok: false, error: { code: ErrorCode.UNAUTHORIZED, message: "Sign-in failed." } };
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
