import { NextResponse } from "next/server";
import type { z } from "zod";
import { AppError, type ErrorCode } from "@/lib/errors";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type ApiSuccess<T> = { success: true; data: T; meta?: PaginationMeta };
export type ApiFailure = {
  success: false;
  error: { code: ErrorCode; message: string; details?: Record<string, unknown> };
};
/** The uniform JSON envelope every `/api/*` route returns. */
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

const NO_STORE = { "Cache-Control": "no-store" } as const;

export function apiOk<T>(data: T, init: { status?: number; meta?: PaginationMeta } = {}) {
  const body: ApiSuccess<T> = { success: true, data, ...(init.meta ? { meta: init.meta } : {}) };
  return NextResponse.json(body, { status: init.status ?? 200, headers: NO_STORE });
}

export function apiNoContent() {
  return new NextResponse(null, { status: 204, headers: NO_STORE });
}

export function apiError(error: AppError) {
  const body: ApiFailure = { success: false, error: error.toJSON() };
  const headers: Record<string, string> = { ...NO_STORE };
  if (error.statusCode === 401) headers["WWW-Authenticate"] = 'Bearer realm="api"';
  return NextResponse.json(body, { status: error.statusCode, headers });
}

/** Parses and validates a JSON request body. Throws ZodError / AppError. */
export async function parseJsonBody<S extends z.ZodType>(request: Request, schema: S) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw AppError.badRequest("Content-Type must be application/json");
  }
  const json: unknown = await request.json();
  return schema.parse(json);
}

/** Validates URL search params against a schema. Throws ZodError. */
export function parseSearchParams<S extends z.ZodType>(request: Request, schema: S) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  return schema.parse(params);
}
