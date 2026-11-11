"use server";

import { revalidatePath } from "next/cache";
import { z } from "@/lib/zod";
import { signOut } from "@/auth";
import { createAction } from "@/lib/safe-action";
import {
  changePasswordSchema,
  createUserSchema,
  updateProfileSchema,
  updateUserSchema,
  userIdSchema,
} from "./user.schema";
import { usersApi } from "./user.api";

/**
 * Server Actions (controllers for client-side events). Client components call
 * these — never `fetch`. Each one is gated and validated by `createAction`,
 * then performs its work over HTTP via `usersApi` (strict-HTTP architecture):
 * the API Route Handlers are the only entry point to the service layer.
 */

export const createUserAction = createAction({
  access: "admin",
  schema: createUserSchema,
  successMessage: "User created",
  handler: async (input) => {
    const created = await usersApi.create(input);
    revalidatePath("/users");
    revalidatePath("/dashboard");
    return { id: created.id };
  },
});

export const updateUserAction = createAction({
  access: "admin",
  schema: z.object({ id: userIdSchema, values: updateUserSchema }),
  successMessage: "User updated",
  handler: async ({ id, values }) => {
    const updated = await usersApi.update(id, values);
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { id: updated.id };
  },
});

export const setUserStatusAction = createAction({
  access: "admin",
  schema: z.object({ id: userIdSchema, isActive: z.boolean() }),
  handler: async ({ id, isActive }) => {
    await usersApi.update(id, { isActive });
    revalidatePath("/users");
    return { isActive };
  },
});

export const deleteUserAction = createAction({
  access: "admin",
  schema: z.object({ id: userIdSchema }),
  successMessage: "User deleted",
  handler: async ({ id }) => {
    await usersApi.remove(id);
    revalidatePath("/users");
    revalidatePath("/dashboard");
  },
});

export const updateProfileAction = createAction({
  schema: updateProfileSchema,
  successMessage: "Profile updated",
  handler: async (input) => {
    await usersApi.updateMe(input);
    revalidatePath("/", "layout");
  },
});

export const changePasswordAction = createAction({
  schema: changePasswordSchema,
  handler: async (input) => {
    await usersApi.changePassword(input);
    // All sessions were revoked (tokenVersion bump) — sign in again.
    await signOut({ redirectTo: "/login?reason=password-changed" });
  },
});
