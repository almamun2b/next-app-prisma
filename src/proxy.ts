import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Next.js 16 Proxy (formerly Middleware). Optimistic route protection based on
 * the JWT only — no database access here. Authoritative checks live in the
 * data access layer (`src/modules/auth/auth.guard.ts`).
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/users/:path*", "/profile/:path*", "/login"],
};
