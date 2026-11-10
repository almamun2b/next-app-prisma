import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  listUsersQuerySchema,
  passwordSchema,
  userIdSchema,
} from "./user.schema";
import { usersHref } from "./user.url";

describe("passwordSchema", () => {
  it.each(["short1!", "alllowercase1!", "ALLUPPERCASE1!", "NoNumbers!!", "NoSymbols123"])(
    "rejects %s",
    (pw) => {
      expect(passwordSchema.safeParse(pw).success).toBe(false);
    },
  );
  it("accepts a strong password", () => {
    expect(passwordSchema.safeParse("Str0ng!Pass").success).toBe(true);
  });
});

describe("changePasswordSchema", () => {
  it("requires matching confirmation and a different new password", () => {
    const mismatch = changePasswordSchema.safeParse({
      currentPassword: "Old1!pass",
      newPassword: "N3w!Password",
      confirmPassword: "x",
    });
    expect(mismatch.error?.issues[0]?.path).toEqual(["confirmPassword"]);
    const same = changePasswordSchema.safeParse({
      currentPassword: "Same1!Pass",
      newPassword: "Same1!Pass",
      confirmPassword: "Same1!Pass",
    });
    expect(same.error?.issues[0]?.path).toEqual(["newPassword"]);
  });
});

describe("listUsersQuerySchema", () => {
  it("falls back to safe defaults for invalid query params", () => {
    expect(
      listUsersQuerySchema.parse({
        page: "-3",
        limit: "999",
        sort: "passwordHash",
        order: "sideways",
        role: "ROOT",
      }),
    ).toEqual({
      page: 1,
      limit: 10,
      sort: "createdAt",
      order: "desc",
      q: undefined,
      role: undefined,
      status: undefined,
    });
  });
  it("coerces valid values", () => {
    expect(listUsersQuerySchema.parse({ page: "3", limit: "20", status: "active" })).toMatchObject({
      page: 3,
      limit: 20,
      status: "active",
    });
  });
});

describe("usersHref", () => {
  const base = listUsersQuerySchema.parse({});
  it("omits defaults and keeps active filters", () => {
    expect(usersHref(base)).toBe("/users");
    const href = usersHref({ ...base, q: "ann", role: "ADMIN" }, { page: 2 });
    const params = new URL(href, "http://x").searchParams;
    expect(Object.fromEntries(params)).toEqual({ q: "ann", role: "ADMIN", page: "2" });
  });
});

describe("userIdSchema", () => {
  it("accepts cuid-like ids only", () => {
    expect(userIdSchema.safeParse("cmhth5d1w0000z8l2d3k4f5g6").success).toBe(true);
    expect(userIdSchema.safeParse("../etc/passwd").success).toBe(false);
  });
});
