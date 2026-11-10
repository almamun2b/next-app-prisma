import type { ReactNode } from "react";
import { requireUser } from "@/modules/auth/auth.guard";
import { AuthProvider } from "@/modules/auth/providers/auth-provider";

/**
 * Resolves the session (redirects to /login when absent) and exposes it to
 * client components through AuthProvider. Pages still authorize themselves.
 */
export async function AppAuthGate({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return <AuthProvider user={user}>{children}</AuthProvider>;
}
