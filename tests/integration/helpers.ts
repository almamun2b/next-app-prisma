import { NextRequest } from "next/server";
import { vi } from "vitest";
import { Role } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/modules/auth/auth.types";

export const authMock = vi.fn<() => Promise<{ user: SessionUser } | null>>();

/** Sets the session returned by the mocked `auth()` (null = signed out). */
export function signInAs(user: SessionUser | null) {
  authMock.mockResolvedValue(user ? { user } : null);
}

export async function resetDatabase() {
  await prisma.user.deleteMany();
}

export async function createUser(
  overrides: Partial<{
    name: string;
    email: string;
    role: Role;
    isActive: boolean;
    password: string;
  }> = {},
) {
  const { password = "Passw0rd!", ...rest } = overrides;
  const user = await prisma.user.create({
    data: {
      name: rest.name ?? "Test User",
      email: rest.email ?? `user-${crypto.randomUUID()}@example.com`,
      role: rest.role ?? Role.USER,
      isActive: rest.isActive ?? true,
      passwordHash: await hashPassword(password),
    },
  });
  const session: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    image: null,
  };
  return { user, session };
}

export function jsonRequest(url: string, method: string, body?: unknown) {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    ...(body !== undefined
      ? { body: JSON.stringify(body), headers: { "content-type": "application/json" } }
      : {}),
  });
}

export const routeContext = <P extends Record<string, string>>(params: P) => ({
  params: Promise.resolve(params),
});
