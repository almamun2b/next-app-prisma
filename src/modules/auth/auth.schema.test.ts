import { describe, expect, it } from "vitest";
import { loginSchema, safeCallbackUrl } from "./auth.schema";

describe("safeCallbackUrl (open-redirect protection)", () => {
  const origin = "https://app.example.com";
  it.each([
    ["/users?page=2", "/users?page=2"],
    ["https://app.example.com/profile", "/profile"],
    ["https://evil.com/phish", "/dashboard"],
    ["//evil.com", "/dashboard"],
    ["/\\evil.com", "/dashboard"],
    ["javascript:alert(1)", "/dashboard"],
    ["/login", "/dashboard"],
    ["/api/users", "/dashboard"],
    [undefined, "/dashboard"],
  ])("%s → %s", (input, expected) => {
    expect(safeCallbackUrl(input, "/dashboard", origin)).toBe(expected);
  });
});

describe("loginSchema", () => {
  it("normalizes email casing and whitespace", () => {
    expect(loginSchema.parse({ email: "  Admin@Example.COM ", password: "x" }).email).toBe(
      "admin@example.com",
    );
  });
  it("requires a password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});
