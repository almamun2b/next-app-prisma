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
import { userService } from "./user.service";

/**
 * Server Actions (controllers for client-side events). Client components call
 * these — never `fetch`. Each one is authenticated, authorized and validated
 * by `createAction`.
 */

export const createUserAction = createAction({
  access: "admin",
  schema: createUserSchema,
  successMessage: "User created",
  handler: async (input, { user }) => {
    const created = await userService.create(user, input);
    revalidatePath("/users");
    revalidatePath("/dashboard");
    return { id: created.id };
  },
});

export const updateUserAction = createAction({
  access: "admin",
  schema: z.object({ id: userIdSchema, values: updateUserSchema }),
  successMessage: "User updated",
  handler: async ({ id, values }, { user }) => {
    const updated = await userService.update(user, id, values);
    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { id: updated.id };
  },
});

export const setUserStatusAction = createAction({
  access: "admin",
  schema: z.object({ id: userIdSchema, isActive: z.boolean() }),
  handler: async ({ id, isActive }, { user }) => {
    await userService.update(user, id, { isActive });
    revalidatePath("/users");
    return { isActive };
  },
});

export const deleteUserAction = createAction({
  access: "admin",
  schema: z.object({ id: userIdSchema }),
  successMessage: "User deleted",
  handler: async ({ id }, { user }) => {
    await userService.remove(user, id);
    revalidatePath("/users");
    revalidatePath("/dashboard");
  },
});

export const updateProfileAction = createAction({
  schema: updateProfileSchema,
  successMessage: "Profile updated",
  handler: async (input, { user }) => {
    await userService.updateProfile(user, input);
    revalidatePath("/", "layout");
  },
});

export const changePasswordAction = createAction({
  schema: changePasswordSchema,
  handler: async (input, { user }) => {
    await userService.changePassword(user, input);
    // All sessions were revoked (tokenVersion bump) — sign in again.
    await signOut({ redirectTo: "/login?reason=password-changed" });
  },
});
