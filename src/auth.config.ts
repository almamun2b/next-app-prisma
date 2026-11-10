import type { NextAuthConfig } from "next-auth";
import { Role } from "@/generated/prisma/enums";

/** Routes that require a session, and the subset that require ADMIN. */
const PROTECTED_PREFIXES = ["/dashboard", "/users", "/profile"];
const ADMIN_PREFIXES = ["/users"];

const startsWithAny = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/**
 * Runtime-agnostic Auth.js config (no Prisma, no bcrypt) shared by `proxy.ts`
 * and `auth.ts`. Proxy authorization is the first gate only — every page,
 * action and API route re-checks access in the data access layer.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60, updateAge: 60 * 60 },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const user = auth?.user;

      if (pathname === "/login" && user) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      if (!startsWithAny(pathname, PROTECTED_PREFIXES)) return true;
      if (!user) return false; // → redirect to /login?callbackUrl=…
      if (startsWithAny(pathname, ADMIN_PREFIXES) && user.role !== Role.ADMIN) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }
      return true;
    },
    jwt({ token, user: signedInUser }) {
      // `user` is only present on the sign-in request (typed as always-present).
      const user = signedInUser as typeof signedInUser | undefined;
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
        token.tokenVersion = user.tokenVersion;
        token.picture = user.image ?? null;
      }
      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        name: token.name ?? "",
        email: token.email ?? "",
        image: token.picture ?? null,
      };
      return session;
    },
  },
} satisfies NextAuthConfig;
