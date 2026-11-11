import "./mocks";
import { beforeEach, describe, expect, it } from "vitest";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  changePasswordAction,
  createUserAction,
  deleteUserAction,
  setUserStatusAction,
  updateProfileAction,
  updateUserAction,
} from "@/modules/user/user.actions";
import { createUser, resetDatabase, signInAs } from "./helpers";
import { signOut } from "@/auth";
import { verifyPassword } from "@/lib/password";

describe("user server actions", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("returns UNAUTHORIZED / FORBIDDEN results instead of throwing", async () => {
    signInAs(null);
    const anon = await createUserAction({
      name: "X Y",
      email: "x@y.com",
      password: "Str0ng!Pass",
      role: "USER",
      isActive: true,
    });
    expect(anon).toMatchObject({ ok: false, error: { code: "UNAUTHORIZED" } });

    const { session } = await createUser();
    signInAs(session);
    const member = await createUserAction({
      name: "X Y",
      email: "x@y.com",
      password: "Str0ng!Pass",
      role: "USER",
      isActive: true,
    });
    expect(member).toMatchObject({ ok: false, error: { code: "FORBIDDEN" } });
  });

  it("creates a user and maps validation errors to fields", async () => {
    const { session } = await createUser({ role: Role.ADMIN });
    signInAs(session);
    const bad = await createUserAction({
      name: "A",
      email: "bad",
      password: "weak",
      role: "USER",
      isActive: true,
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok)
      expect(Object.keys(bad.error.fieldErrors ?? {})).toEqual(
        expect.arrayContaining(["name", "email", "password"]),
      );

    const good = await createUserAction({
      name: "Good User",
      email: "good@example.com",
      password: "Str0ng!Pass",
      role: "USER",
      isActive: true,
    });
    expect(good).toMatchObject({ ok: true, message: "User created" });
  });

  it("blocks self-deactivation and keeps the last active admin", async () => {
    const { user: admin, session } = await createUser({ role: Role.ADMIN });
    signInAs(session);
    const self = await setUserStatusAction({ id: admin.id, isActive: false });
    expect(self).toMatchObject({ ok: false, error: { code: "BAD_REQUEST" } });

    const { user: other } = await createUser({ role: Role.ADMIN });
    const demote = await updateUserAction({ id: other.id, values: { role: Role.USER } });
    expect(demote.ok).toBe(true);
    const revoked = await prisma.user.findUniqueOrThrow({ where: { id: other.id } });
    expect(revoked.tokenVersion).toBe(1);
  });

  it("lets a user update their own profile", async () => {
    const { user, session } = await createUser({ name: "Old Name" });
    signInAs(session);
    const result = await updateProfileAction({ name: "  New Name  " });
    expect(result.ok).toBe(true);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).name).toBe("New Name");
  });
  it("surfaces API conflicts as field errors through the HTTP layer", async () => {
    const { session, user } = await createUser({ role: Role.ADMIN });
    signInAs(session);
    const result = await createUserAction({
      name: "Dup User",
      email: user.email,
      password: "Str0ng!Pass",
      role: "USER",
      isActive: true,
    });
    expect(result).toMatchObject({ ok: false, error: { code: "CONFLICT" } });
    if (!result.ok) expect(result.error.fieldErrors).toHaveProperty("email");
  });

  it("maps API 404 and 403 errors to action results", async () => {
    const { session } = await createUser({ role: Role.ADMIN });
    signInAs(session);
    const missing = await deleteUserAction({ id: "abcdefghijklmnopqrstuvwxy" });
    expect(missing).toMatchObject({ ok: false, error: { code: "NOT_FOUND" } });
  });

  it("deletes a user over the API", async () => {
    const { session } = await createUser({ role: Role.ADMIN });
    const { user: target } = await createUser();
    signInAs(session);
    expect(await deleteUserAction({ id: target.id })).toMatchObject({ ok: true });
    expect(await prisma.user.findUnique({ where: { id: target.id } })).toBeNull();
  });

  it("changes the password via the API, revokes sessions and signs out", async () => {
    const { user, session } = await createUser({ password: "Old1!Passw0rd" });
    signInAs(session);
    const wrong = await changePasswordAction({
      currentPassword: "Nope1!Passw0rd",
      newPassword: "N3w!Passw0rd",
      confirmPassword: "N3w!Passw0rd",
    });
    expect(wrong).toMatchObject({ ok: false, error: { code: "VALIDATION_ERROR" } });
    expect(signOut).not.toHaveBeenCalled();

    const ok = await changePasswordAction({
      currentPassword: "Old1!Passw0rd",
      newPassword: "N3w!Passw0rd",
      confirmPassword: "N3w!Passw0rd",
    });
    expect(ok.ok).toBe(true);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(after.tokenVersion).toBe(1);
    expect(await verifyPassword("N3w!Passw0rd", after.passwordHash)).toBe(true);
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/login?reason=password-changed" });
  });
});
