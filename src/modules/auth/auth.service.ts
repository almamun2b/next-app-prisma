import "server-only";
import type { JWT } from "next-auth/jwt";
import { verifyAgainstDummy, verifyPassword } from "@/lib/password";
import { createRateLimiter } from "@/lib/rate-limit";
import { userRepository } from "@/modules/user/user.repository";
import {
  AccountDisabledError,
  InvalidCredentialsError,
  LoginRateLimitedError,
} from "./auth.errors";
import type { LoginInput } from "./auth.schema";

/** 5 failed attempts per IP+email per 15 minutes. */
const loginLimiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

export const authService = {
  /**
   * Verifies credentials. Returns the session-ready user or throws a
   * CredentialsSignin subclass whose `code` the login form maps to a message.
   */
  async authenticate({ email, password }: Required<LoginInput>, clientIp: string) {
    const key = `${clientIp}:${email}`;
    if (!loginLimiter.hit(key).allowed) throw new LoginRateLimitedError();

    const user = await userRepository.findCredentialsByEmail(email);
    if (!user) {
      await verifyAgainstDummy(password);
      throw new InvalidCredentialsError();
    }
    if (!(await verifyPassword(password, user.passwordHash))) throw new InvalidCredentialsError();
    if (!user.isActive) throw new AccountDisabledError();

    loginLimiter.reset(key);
    await userRepository.touchLastLogin(user.id);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
  },

  /**
   * Re-validates a JWT against the database. Returns the refreshed token, or
   * `null` when the user was deleted, deactivated, or their sessions revoked
   * (password change / role change bump `tokenVersion`).
   */
  async refreshToken(token: JWT): Promise<JWT | null> {
    const state = await userRepository.findSessionState(token.id);
    if (!state?.isActive || state.tokenVersion !== token.tokenVersion) return null;
    return {
      ...token,
      name: state.name,
      email: state.email,
      picture: state.image,
      role: state.role,
    };
  },
};
