import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "@/lib/http/api-client";
import { usersApi } from "./user.api";

vi.mock("@/lib/http/api-client", () => ({ apiRequest: vi.fn() }));
const request = vi.mocked(apiRequest);

const raw = (over: Record<string, unknown> = {}) => ({
  id: "u1",
  name: "Ann",
  email: "ann@x.com",
  role: "USER",
  isActive: true,
  image: null,
  lastLoginAt: "2026-01-02T03:04:05.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

describe("usersApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revives ISO date strings into Date objects", async () => {
    request.mockResolvedValue({ data: raw(), meta: undefined });
    const user = await usersApi.get("u1");
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.lastLoginAt).toEqual(new Date("2026-01-02T03:04:05.000Z"));
    expect(request).toHaveBeenCalledWith("/api/users/u1");
  });

  it("keeps a null lastLoginAt", async () => {
    request.mockResolvedValue({ data: raw({ lastLoginAt: null }), meta: undefined });
    expect((await usersApi.me()).lastLoginAt).toBeNull();
  });

  it("lists with the query as search params and returns pagination meta", async () => {
    const meta = { page: 2, limit: 10, total: 25, totalPage: 3 };
    request.mockResolvedValue({ data: [raw()], meta });
    const query = { page: 2, limit: 10, sort: "name", order: "asc", q: "ann" } as const;
    const result = await usersApi.list({ ...query, role: undefined, status: undefined });
    expect(request).toHaveBeenCalledWith("/api/users", {
      query: expect.objectContaining({ q: "ann", page: 2 }),
    });
    expect(result.meta).toEqual(meta);
    expect(result.data[0]?.createdAt).toBeInstanceOf(Date);
  });

  it("maps mutations to the right verbs and paths", async () => {
    request.mockResolvedValue({ data: raw(), meta: undefined });
    await usersApi.update("u1", { isActive: false });
    expect(request).toHaveBeenLastCalledWith("/api/users/u1", {
      method: "PATCH",
      body: { isActive: false },
    });
    await usersApi.remove("u1");
    expect(request).toHaveBeenLastCalledWith("/api/users/u1", { method: "DELETE" });
    await usersApi.updateMe({ name: "New" });
    expect(request).toHaveBeenLastCalledWith("/api/users/me", {
      method: "PATCH",
      body: { name: "New" },
    });
    const pw = { currentPassword: "a", newPassword: "b", confirmPassword: "b" };
    await usersApi.changePassword(pw);
    expect(request).toHaveBeenLastCalledWith("/api/users/me/password", {
      method: "POST",
      body: pw,
    });
  });

  it("returns the newest users via the list endpoint", async () => {
    request.mockResolvedValue({
      data: Array.from({ length: 10 }, (_, i) => raw({ id: `u${String(i)}` })),
      meta: { page: 1, limit: 10, total: 10, totalPage: 1 },
    });
    expect(await usersApi.recent(3)).toHaveLength(3);
  });
});
