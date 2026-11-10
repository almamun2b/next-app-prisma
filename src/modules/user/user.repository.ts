import "server-only";
import { QueryBuilder } from "query-builder-prisma";
import type { Prisma } from "@/generated/prisma/client";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { publicUserSelect, type PublicUser, type UserStats } from "./user.dto";
import type { ListUsersQuery } from "./user.schema";

/**
 * Model layer — the ONLY place that talks to Prisma for users.
 * Every read that leaves this file uses `publicUserSelect`.
 */
export const userRepository = {
  async list(query: ListUsersQuery) {
    const isActive = query.status ? query.status === "active" : undefined;
    return new QueryBuilder(prisma.user, { dialect: "postgresql" })
      .search({ searchText: query.q, fields: ["name", "email"] })
      .filter({ role: query.role, isActive })
      .sortBy({ sortBy: query.sort, sortOrder: query.order })
      .paginate({ page: query.page, limit: query.limit })
      .select(publicUserSelect)
      .executeWithMeta();
  },

  findById(id: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
  },

  findByEmail(email: string): Promise<PublicUser | null> {
    return prisma.user.findUnique({ where: { email }, select: publicUserSelect });
  },

  /** Credentials lookup — includes the hash. Used by the auth module only. */
  findCredentialsByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { ...publicUserSelect, passwordHash: true, tokenVersion: true },
    });
  },

  findPasswordHash(id: string) {
    return prisma.user.findUnique({ where: { id }, select: { passwordHash: true } });
  },

  /** Minimal state used to re-validate a session token on each request. */
  findSessionState(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        image: true,
        role: true,
        isActive: true,
        tokenVersion: true,
      },
    });
  },

  create(data: Prisma.UserCreateInput): Promise<PublicUser> {
    return prisma.user.create({ data, select: publicUserSelect });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<PublicUser> {
    return prisma.user.update({ where: { id }, data, select: publicUserSelect });
  },

  delete(id: string): Promise<PublicUser> {
    return prisma.user.delete({ where: { id }, select: publicUserSelect });
  },

  touchLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
      select: { id: true },
    });
  },

  countActiveAdmins() {
    return prisma.user.count({ where: { role: Role.ADMIN, isActive: true } });
  },

  async stats(): Promise<UserStats> {
    const [total, active, admins] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
    ]);
    return { total, active, inactive: total - active, admins };
  },

  recent(limit = 5): Promise<PublicUser[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: publicUserSelect,
    });
  },
};

export type UserRepository = typeof userRepository;
