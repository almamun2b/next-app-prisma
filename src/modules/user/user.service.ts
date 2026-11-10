import "server-only";
import { Role } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { SessionUser } from "@/modules/auth/auth.types";
import { userRepository } from "./user.repository";
import type {
  ChangePasswordInput,
  CreateUserInput,
  ListUsersQuery,
  UpdateProfileInput,
  UpdateUserInput,
} from "./user.schema";

type Actor = Pick<SessionUser, "id" | "role">;

/** Authorization policy (defence in depth — callers already gate access). */
function assertAdmin(actor: Actor) {
  if (actor.role !== Role.ADMIN) throw AppError.forbidden();
}

async function getOrThrow(id: string) {
  const user = await userRepository.findById(id);
  if (!user) throw AppError.notFound("User not found");
  return user;
}

/** Prevents locking the system out by removing the last active administrator. */
async function assertNotLastAdmin(target: { role: Role; isActive: boolean }) {
  if (target.role !== Role.ADMIN || !target.isActive) return;
  if ((await userRepository.countActiveAdmins()) <= 1) {
    throw AppError.conflict("At least one active administrator is required");
  }
}

/**
 * Business-logic layer for users. Framework-agnostic: called by API
 * controllers, Server Actions and Server Components alike.
 */
export const userService = {
  async list(actor: Actor, query: ListUsersQuery) {
    assertAdmin(actor);
    return userRepository.list(query);
  },

  async stats(actor: Actor) {
    assertAdmin(actor);
    return userRepository.stats();
  },

  async recent(actor: Actor, limit?: number) {
    assertAdmin(actor);
    return userRepository.recent(limit);
  },

  async getById(actor: Actor, id: string) {
    if (actor.id !== id) assertAdmin(actor);
    return getOrThrow(id);
  },

  async create(actor: Actor, input: Required<CreateUserInput>) {
    assertAdmin(actor);
    const { password, ...rest } = input;
    return userRepository.create({ ...rest, passwordHash: await hashPassword(password) });
  },

  async update(actor: Actor, id: string, input: UpdateUserInput) {
    assertAdmin(actor);
    const target = await getOrThrow(id);
    const isSelf = actor.id === id;

    if (isSelf && (input.isActive === false || (input.role && input.role !== target.role))) {
      throw AppError.badRequest("You cannot deactivate yourself or change your own role");
    }
    const losesAdmin =
      (input.role !== undefined && input.role !== Role.ADMIN) || input.isActive === false;
    if (losesAdmin) await assertNotLastAdmin(target);

    const { password, ...rest } = input;
    const data: Prisma.UserUpdateInput = { ...rest };
    if (password) data.passwordHash = await hashPassword(password);

    // Revoke the target's sessions when credentials or privileges change.
    const revoke =
      Boolean(password) ||
      input.isActive === false ||
      (input.role !== undefined && input.role !== target.role);
    if (revoke) data.tokenVersion = { increment: 1 };

    return userRepository.update(id, data);
  },

  async remove(actor: Actor, id: string) {
    assertAdmin(actor);
    if (actor.id === id) throw AppError.badRequest("You cannot delete your own account");
    const target = await getOrThrow(id);
    await assertNotLastAdmin(target);
    return userRepository.delete(id);
  },

  /* ── Self-service ──────────────────────────────────────────────────── */

  async getProfile(actor: Actor) {
    return getOrThrow(actor.id);
  },

  async updateProfile(actor: Actor, input: Required<UpdateProfileInput>) {
    return userRepository.update(actor.id, { name: input.name });
  },

  async changePassword(actor: Actor, input: ChangePasswordInput) {
    const record = await userRepository.findPasswordHash(actor.id);
    if (!record) throw AppError.notFound("User not found");
    if (!(await verifyPassword(input.currentPassword, record.passwordHash))) {
      throw AppError.validation("Current password is incorrect", {
        currentPassword: ["Current password is incorrect"],
      });
    }
    await userRepository.update(actor.id, {
      passwordHash: await hashPassword(input.newPassword),
      tokenVersion: { increment: 1 },
    });
  },
};
