import "server-only";
import { headers } from "next/headers";
import { AppError, ErrorCode } from "@/lib/errors";
import type { ApiResponse, PaginationMeta } from "./api-response";

/**
 * Server-side HTTP client for the app's own `/api/*` routes (strict-HTTP
 * architecture). Server Components and Server Actions use it instead of
 * calling services directly, so Route Handlers are the single entry point
 * to the business layer.
 *
 * - Runs on the server only (`server-only`); browsers never call the API.
 * - Forwards the incoming request's session cookie.
 * - Targets `INTERNAL_API_URL` (default: loopback on `PORT`) so the call never
 *   leaves the host and is not influenced by the request's Host header.
 * - Re-throws API failures as `AppError`, preserving status, code and field errors.
 */
type Query = Record<string, string | number | boolean | undefined>;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
};

export type ApiResult<T> = { data: T; meta: PaginationMeta | undefined };

export function internalApiUrl() {
  // An empty value (e.g. `INTERNAL_API_URL=` in docker-compose) must fall back too.
  const configured = process.env.INTERNAL_API_URL?.trim() ?? "";
  const fallback = `http://localhost:${process.env.PORT ?? "3000"}`;
  return (configured.length > 0 ? configured : fallback).replace(/\/$/, "");
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${internalApiUrl()}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

async function parseEnvelope<T>(response: Response): Promise<ApiResponse<T> | null> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

export async function apiRequest<T = void>(
  path: string,
  { method = "GET", body, query }: RequestOptions = {},
): Promise<ApiResult<T>> {
  const incoming = await headers();
  const cookie = incoming.get("cookie");

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      cache: "no-store",
      headers: {
        accept: "application/json",
        ...(cookie ? { cookie } : {}),
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    throw AppError.serviceUnavailable("The API is temporarily unreachable", error);
  }

  if (response.status === 204) return { data: undefined as T, meta: undefined };

  const envelope = await parseEnvelope<T>(response);
  if (!envelope) {
    throw new AppError(
      response.status >= 400 ? response.status : 502,
      ErrorCode.INTERNAL_ERROR,
      "The API returned an unexpected response",
      { isOperational: false },
    );
  }
  if (!envelope.success) {
    const { code, message, details } = envelope.error;
    throw new AppError(response.status, code, message, {
      details,
      isOperational: response.status < 500,
    });
  }
  return { data: envelope.data, meta: envelope.meta };
}
