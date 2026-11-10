import "./mocks";
import { beforeEach, describe, expect, it } from "vitest";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  createUserAction,
  setUserStatusAction,
  updateProfileAction,
  updateUserAction,
} from "@/modules/user/user.actions";
import { createUser, resetDatabase, signInAs } from "./helpers";

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
});
