"use client";

import { createContext, use, type ReactNode } from "react";
import { Role } from "@/generated/prisma/enums";
import type { SessionUser } from "../auth.types";

const AuthContext = createContext<SessionUser | null | undefined>(undefined);

/**
 * Exposes the session user (resolved on the server via `getSessionUser()`)
 * to client components — no client-side `/api/auth/session` request.
 */
export function AuthProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return <AuthContext value={user}>{children}</AuthContext>;
}

export function useAuth() {
  const user = use(AuthContext);
  if (user === undefined) throw new Error("useAuth must be used within <AuthProvider>");
  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === Role.ADMIN,
  } as const;
}
