import "server-only";
import { redirect, forbidden } from "next/navigation";
import { cache } from "react";
import { auth } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { AppError } from "@/lib/errors";
import type { SessionUser } from "./auth.types";

/**
 * Data Access Layer for authentication. The single place that reads the
 * session. Deduplicated per request with React `cache`.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await auth();
  return session?.user.id ? session.user : null;
});

export const isAdmin = (user: Pick<SessionUser, "role"> | null) => user?.role === Role.ADMIN;

/* ── Pages / Server Components: navigate on failure ─────────────────────── */

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isAdmin(user)) forbidden();
  return user;
}

/* ── API routes / Server Actions: throw AppError on failure ─────────────── */

export async function authenticate(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw AppError.unauthorized();
  return user;
}

export async function authenticateAdmin(): Promise<SessionUser> {
  const user = await authenticate();
  if (!isAdmin(user)) throw AppError.forbidden();
  return user;
}
