import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { InvalidCredentialsError } from "@/modules/auth/auth.errors";
import { loginSchema } from "@/modules/auth/auth.schema";
import { authService } from "@/modules/auth/auth.service";
import "@/modules/auth/auth.types";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ?? request.headers.get("x-real-ip") ?? "unknown";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: { type: "email" }, password: { type: "password" } },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) throw new InvalidCredentialsError();
        return authService.authenticate(parsed.data, clientIp(request));
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt(params) {
      const token = authConfig.callbacks.jwt(params);
      // Fresh sign-in: token was just built from `user`.
      if ((params.user as typeof params.user | undefined) !== undefined) return token;
      // Every subsequent read: re-validate against the DB (revocation support).
      return authService.refreshToken(token);
    },
  },
});
