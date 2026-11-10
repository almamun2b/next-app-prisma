import { beforeEach, describe, expect, it, vi } from "vitest";
import { Role } from "@/generated/prisma/enums";
import { AppError } from "@/lib/errors";
import { userRepository } from "./user.repository";
import { userService } from "./user.service";

vi.mock("./user.repository", () => ({
  userRepository: {
    list: vi.fn(),
    findById: vi.fn(),
    findPasswordHash: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countActiveAdmins: vi.fn(),
    stats: vi.fn(),
    recent: vi.fn(),
  },
}));
vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn((p: string) => Promise.resolve(`hashed:${p}`)),
  verifyPassword: vi.fn((plain: string, hash: string) =>
    Promise.resolve(hash === `hashed:${plain}`),
  ),
}));

const repo = vi.mocked(userRepository);
const admin = { id: "admin1", role: Role.ADMIN };
const member = { id: "member1", role: Role.USER };
const record = (over: Partial<{ id: string; role: Role; isActive: boolean }> = {}) => ({
  id: "u1",
  name: "U",
  email: "u@x.com",
  role: Role.USER,
  isActive: true,
  image: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forbids non-admins from admin operations", async () => {
    await expect(userService.list(member, {} as never)).rejects.toMatchObject({ statusCode: 403 });
    await expect(userService.getById(member, "someone-else")).rejects.toBeInstanceOf(AppError);
  });

  it("lets users read their own record", async () => {
    repo.findById.mockResolvedValue(record({ id: member.id }));
    await expect(userService.getById(member, member.id)).resolves.toMatchObject({ id: member.id });
  });

  it("hashes the password on create", async () => {
    repo.create.mockResolvedValue(record());
    await userService.create(admin, {
      name: "N",
      email: "n@x.com",
      password: "P",
      role: Role.USER,
      isActive: true,
    });
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ passwordHash: "hashed:P" }));
    expect(repo.create.mock.calls[0]?.[0]).not.toHaveProperty("password");
  });

  it("revokes sessions when password, role or status changes", async () => {
    repo.findById.mockResolvedValue(record());
    repo.update.mockResolvedValue(record());
    await userService.update(admin, "u1", { password: "N3w!pass" });
    expect(repo.update).toHaveBeenLastCalledWith(
      "u1",
      expect.objectContaining({ tokenVersion: { increment: 1 } }),
    );
    await userService.update(admin, "u1", { name: "Only name" });
    expect(repo.update).toHaveBeenLastCalledWith("u1", { name: "Only name" });
  });

  it("protects the last active administrator", async () => {
    repo.findById.mockResolvedValue(record({ id: "a2", role: Role.ADMIN }));
    repo.countActiveAdmins.mockResolvedValue(1);
    await expect(userService.update(admin, "a2", { role: Role.USER })).rejects.toMatchObject({
      statusCode: 409,
    });
    await expect(userService.remove(admin, "a2")).rejects.toMatchObject({ statusCode: 409 });
  });

  it("prevents self-deletion and self-deactivation", async () => {
    repo.findById.mockResolvedValue(record({ id: admin.id, role: Role.ADMIN }));
    await expect(userService.remove(admin, admin.id)).rejects.toMatchObject({ statusCode: 400 });
    await expect(userService.update(admin, admin.id, { isActive: false })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("verifies the current password before changing it", async () => {
    repo.findPasswordHash.mockResolvedValue({ passwordHash: "hashed:Right1!" });
    await expect(
      userService.changePassword(member, {
        currentPassword: "Wrong1!",
        newPassword: "N3w!pass",
        confirmPassword: "N3w!pass",
      }),
    ).rejects.toMatchObject({ statusCode: 422 });
    await userService.changePassword(member, {
      currentPassword: "Right1!",
      newPassword: "N3w!pass",
      confirmPassword: "N3w!pass",
    });
    expect(repo.update).toHaveBeenCalledWith(member.id, {
      passwordHash: "hashed:N3w!pass",
      tokenVersion: { increment: 1 },
    });
  });
});
