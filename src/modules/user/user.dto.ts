import type { Role } from "@/generated/prisma/enums";

/**
 * Prisma `select` allowlist for anything that leaves the repository.
 * `passwordHash` and `tokenVersion` are intentionally absent.
 */
export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  image: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/** Safe user shape returned by services, API routes and server actions. */
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  image: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserStats = {
  total: number;
  active: number;
  inactive: number;
  admins: number;
};
