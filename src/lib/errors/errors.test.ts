import { describe, expect, it, vi } from "vitest";
import { z } from "@/lib/zod";
import { AppError, ErrorCode } from "./app-error";
import { handleError, toAppError } from "./handle-error";
import { normalizePrismaError, targetFields } from "./normalize-prisma";
import { normalizeZodError } from "./normalize-zod";

const prismaError = (code: string, meta?: Record<string, unknown>) =>
  Object.assign(new Error("db"), { name: "PrismaClientKnownRequestError", code, meta });

describe("AppError", () => {
  it("builds typed errors with status codes and safe JSON", () => {
    const err = AppError.conflict("Taken", { fieldErrors: { email: ["Taken"] } });
    expect(err).toMatchObject({ statusCode: 409, code: ErrorCode.CONFLICT, isOperational: true });
    expect(err.toJSON()).toEqual({
      code: "CONFLICT",
      message: "Taken",
      details: { fieldErrors: { email: ["Taken"] } },
    });
    expect(AppError.internal().isOperational).toBe(false);
    expect(AppError.notFound().statusCode).toBe(404);
  });
});

describe("normalizeZodError", () => {
  it("groups issues by field path and keeps form-level messages", () => {
    const schema = z.object({ email: z.email(), profile: z.object({ age: z.number().min(18) }) });
    const result = schema.safeParse({ email: "x", profile: { age: 3 } });
    const err = normalizeZodError(result.error!);
    expect(err.statusCode).toBe(422);
    expect(Object.keys(err.details?.fieldErrors ?? {})).toEqual(["email", "profile.age"]);
  });
});

describe("normalizePrismaError", () => {
  it.each([
    ["P2002", 409],
    ["P2025", 404],
    ["P2003", 409],
    ["P2000", 400],
    ["P2024", 503],
    ["P9999", 500],
  ])("maps %s to HTTP %i", (code, status) => {
    expect(normalizePrismaError(prismaError(code)).statusCode).toBe(status);
  });

  it("extracts unique fields from classic and driver-adapter metadata", () => {
    expect(targetFields({ target: ["email"] })).toEqual(["email"]);
    expect(
      targetFields({
        driverAdapterError: { cause: { table: "User", constraint: { index: "User_email_key" } } },
      }),
    ).toEqual(["email"]);
    expect(
      normalizePrismaError(prismaError("P2002", { target: ["email"] })).details?.fieldErrors,
    ).toHaveProperty("email");
  });

  it("maps validation and initialization errors", () => {
    expect(
      normalizePrismaError(Object.assign(new Error(), { name: "PrismaClientValidationError" }))
        .statusCode,
    ).toBe(400);
    expect(
      normalizePrismaError(Object.assign(new Error(), { name: "PrismaClientInitializationError" }))
        .statusCode,
    ).toBe(503);
  });
});

describe("handleError", () => {
  it("passes AppErrors through and wraps unknown errors as 500", () => {
    const known = AppError.forbidden();
    expect(toAppError(known)).toBe(known);
    expect(toAppError(new Error("boom")).statusCode).toBe(500);
    expect(toAppError(new SyntaxError("bad json")).statusCode).toBe(400);
  });

  it("hides internal messages in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const err = handleError(AppError.internal("secret stack detail"));
    expect(err.message).toBe("Something went wrong");
    vi.unstubAllEnvs();
  });
});
