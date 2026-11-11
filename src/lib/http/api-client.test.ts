import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";
import { apiRequest, internalApiUrl } from "./api-client";

vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers({ cookie: "authjs.session-token=abc" })),
}));

const fetchMock = vi.fn<typeof fetch>();
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("apiRequest (server-side HTTP client)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("INTERNAL_API_URL", "http://api.internal:4000/");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("calls the internal URL, forwards the session cookie and disables caching", async () => {
    fetchMock.mockResolvedValue(
      json({
        success: true,
        data: [{ id: "1" }],
        meta: { page: 1, limit: 10, total: 1, totalPage: 1 },
      }),
    );
    const result = await apiRequest("/api/users", {
      query: { q: "ann", role: undefined, page: 2, empty: "" },
    });

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("http://api.internal:4000/api/users?q=ann&page=2");
    expect(init).toMatchObject({ method: "GET", cache: "no-store" });
    expect(init.headers).toMatchObject({
      cookie: "authjs.session-token=abc",
      accept: "application/json",
    });
    expect(result.meta?.total).toBe(1);
  });

  it("sends JSON bodies with a content type", async () => {
    fetchMock.mockResolvedValue(json({ success: true, data: { id: "1" } }, 201));
    await apiRequest("/api/users", { method: "POST", body: { name: "A" } });
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(init.body).toBe('{"name":"A"}');
    expect(init.headers).toMatchObject({ "content-type": "application/json" });
  });

  it("returns undefined data for 204 responses", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiRequest("/api/users/1", { method: "DELETE" })).resolves.toEqual({
      data: undefined,
      meta: undefined,
    });
  });

  it("rethrows API failures as AppError with status, code and field errors", async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Taken",
            details: { fieldErrors: { email: ["Taken"] } },
          },
        },
        409,
      ),
    );
    const error = await apiRequest("/api/users", { method: "POST", body: {} }).catch(
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 409,
      code: "CONFLICT",
      isOperational: true,
      details: { fieldErrors: { email: ["Taken"] } },
    });
  });

  it("treats 5xx API failures as non-operational", async () => {
    fetchMock.mockResolvedValue(
      json({ success: false, error: { code: "INTERNAL_ERROR", message: "boom" } }, 500),
    );
    await expect(apiRequest("/api/users")).rejects.toMatchObject({
      statusCode: 500,
      isOperational: false,
    });
  });

  it("reports an unreachable API as 503", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await expect(apiRequest("/api/users")).rejects.toMatchObject({
      statusCode: 503,
      code: "SERVICE_UNAVAILABLE",
    });
  });

  it("does not trust non-JSON responses", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad gateway</html>", { status: 502 }));
    await expect(apiRequest("/api/users")).rejects.toMatchObject({
      statusCode: 502,
      isOperational: false,
    });
  });

  it("defaults to loopback on PORT when INTERNAL_API_URL is unset", () => {
    vi.stubEnv("INTERNAL_API_URL", "");
    vi.stubEnv("PORT", "3100");
    expect(internalApiUrl()).toBe("http://localhost:3100");
  });
});
