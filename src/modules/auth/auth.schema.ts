import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z.string().min(1, "Enter your password").max(72),
});
export type LoginInput = z.input<typeof loginSchema>;

/**
 * Open-redirect protection: only same-origin destinations are accepted after
 * login. Absolute URLs (Auth.js passes them) are reduced to path + query.
 */
export function safeCallbackUrl(value: unknown, fallback = "/dashboard", origin?: string): string {
  if (typeof value !== "string" || value.length === 0) return fallback;
  let path = value;
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!origin || url.origin !== new URL(origin).origin) return fallback;
      path = `${url.pathname}${url.search}`;
    } catch {
      return fallback;
    }
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (path.startsWith("/login") || path.startsWith("/api")) return fallback;
  return path;
}
