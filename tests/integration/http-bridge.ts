import { NextRequest } from "next/server";
import { vi } from "vitest";
import {
  DELETE as deleteUser,
  GET as getUser,
  PATCH as patchUser,
} from "@/app/api/users/[id]/route";
import { POST as changePassword } from "@/app/api/users/me/password/route";
import { GET as getMe, PATCH as patchMe } from "@/app/api/users/me/route";
import { GET as listUsers, POST as createUser } from "@/app/api/users/route";
import { GET as getStats } from "@/app/api/users/stats/route";

type Method = "GET" | "POST" | "PATCH" | "DELETE";
type Handler = (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => Promise<Response>;
type Route = { pattern: RegExp; handlers: Partial<Record<Method, Handler>> };

/** Most specific first — mirrors Next.js static-over-dynamic route precedence. */
const ROUTES: Route[] = [
  { pattern: /^\/api\/users\/stats$/, handlers: { GET: getStats } },
  { pattern: /^\/api\/users\/me\/password$/, handlers: { POST: changePassword } },
  { pattern: /^\/api\/users\/me$/, handlers: { GET: getMe, PATCH: patchMe } },
  {
    pattern: /^\/api\/users\/([^/]+)$/,
    handlers: { GET: getUser, PATCH: patchUser, DELETE: deleteUser },
  },
  {
    pattern: /^\/api\/users$/,
    handlers: { GET: listUsers, POST: createUser },
  },
];

/**
 * Replaces `fetch` so the server-side API client reaches the REAL Route
 * Handlers (auth → validation → service → Postgres) without an HTTP server.
 */
async function bridgeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : input.toString());
  const method = (init?.method ?? "GET") as Method;
  for (const { pattern, handlers } of ROUTES) {
    const match = pattern.exec(url.pathname);
    const handler = handlers[method];
    if (!match || !handler) continue;
    const request = new NextRequest(url, { ...init, method } as ConstructorParameters<
      typeof NextRequest
    >[1]);
    return handler(request, { params: Promise.resolve({ id: match[1] ?? "" }) });
  }
  return new Response(
    JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "No route" } }),
    {
      status: 404,
    },
  );
}

export function installApiBridge() {
  vi.stubGlobal("fetch", bridgeFetch);
}
