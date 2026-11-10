import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password").max(72),
});
export type LoginInput = z.input<typeof loginSchema>;

/** Only same-origin relative paths are accepted as post-login destinations. */
export function safeCallbackUrl(value: unknown, fallback = "/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/api")) return fallback;
  return value;
}
