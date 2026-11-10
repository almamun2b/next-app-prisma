import { CredentialsSignin } from "next-auth";

/** Thrown from `authorize()`; the `code` reaches the login action. */
export class InvalidCredentialsError extends CredentialsSignin {
  override code = "invalid_credentials";
}

export class AccountDisabledError extends CredentialsSignin {
  override code = "account_disabled";
}

export class LoginRateLimitedError extends CredentialsSignin {
  override code = "rate_limited";
}

export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Invalid email or password.",
  account_disabled: "Your account has been deactivated. Contact an administrator.",
  rate_limited: "Too many sign-in attempts. Please wait a few minutes and try again.",
};
