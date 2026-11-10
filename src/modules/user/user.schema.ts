import { z } from "zod";
import { Role } from "@/generated/prisma/enums";

/**
 * Validation schemas shared by the client (react-hook-form) and the server
 * (API controllers + server actions). Single source of truth for input rules.
 */
export const roleSchema = z.enum([Role.ADMIN, Role.USER]);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/\d/, "Include at least one number")
  .regex(/[^A-Za-z0-9]/, "Include at least one symbol");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name must be at most 80 characters");
const emailSchema = z.email("Enter a valid email address").trim().toLowerCase().max(254);

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  isActive: z.boolean(),
});
export type CreateUserInput = z.input<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    role: roleSchema,
    isActive: z.boolean(),
    password: z.union([passwordSchema, z.literal("")]),
  })
  .partial();
export type UpdateUserInput = z.input<typeof updateUserSchema>;

export const updateProfileSchema = z.object({ name: nameSchema });
export type UpdateProfileInput = z.input<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "New password must differ from the current one",
  });
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;

export const USER_SORT_FIELDS = ["name", "email", "role", "createdAt", "lastLoginAt"] as const;
export const USER_STATUS = ["active", "inactive"] as const;
export const PAGE_SIZES = [10, 20, 50] as const;

/** Query-string schema for the users list (API `?q=` and page `searchParams`). */
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce
    .number()
    .int()
    .refine((n) => (PAGE_SIZES as readonly number[]).includes(n))
    .catch(10),
  q: z.string().trim().max(100).optional().catch(undefined),
  role: roleSchema.optional().catch(undefined),
  status: z.enum(USER_STATUS).optional().catch(undefined),
  sort: z.enum(USER_SORT_FIELDS).catch("createdAt"),
  order: z.enum(["asc", "desc"]).catch("desc"),
});
export type ListUsersQuery = z.output<typeof listUsersQuerySchema>;

/** Prisma `@default(cuid())` ids: lowercase alphanumerics, ~25 chars. */
export const userIdSchema = z.string().regex(/^[a-z0-9]{20,32}$/, "Invalid user id");
