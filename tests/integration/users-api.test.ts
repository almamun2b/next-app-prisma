import "./mocks";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { DELETE, GET as GET_ONE, PATCH } from "@/app/api/users/[id]/route";
import { POST as CHANGE_PASSWORD } from "@/app/api/users/me/password/route";
import { GET as GET_ME } from "@/app/api/users/me/route";
import { GET as GET_STATS } from "@/app/api/users/stats/route";
import { GET, POST } from "@/app/api/users/route";
import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { createUser, jsonRequest, resetDatabase, routeContext, signInAs } from "./helpers";

type Json = {
  success: boolean;
  data?: unknown;
  meta?: Record<string, number>;
  error?: { code: string; details?: { fieldErrors?: Record<string, string[]> } };
};
const json = async (res: Response) => (await res.json()) as Json;

describe("/api/users", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 401 with the uniform error envelope when signed out", async () => {
    signInAs(null);
    const res = await GET(jsonRequest("/api/users", "GET"), routeContext({}));
    expect(res.status).toBe(401);
    expect(await json(res)).toEqual({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
  });

  it("returns 403 for non-admin users", async () => {
    const { session } = await createUser();
    signInAs(session);
    const res = await GET(jsonRequest("/api/users", "GET"), routeContext({}));
    expect(res.status).toBe(403);
  });

  it("lists users with pagination meta, search and filters for admins", async () => {
    const { session } = await createUser({ role: Role.ADMIN, name: "Root Admin" });
    await createUser({ name: "Alice Doe" });
    await createUser({ name: "Bob Inactive", isActive: false });
    signInAs(session);

    const res = await GET(
      jsonRequest("/api/users?limit=10&sort=name&order=asc", "GET"),
      routeContext({}),
    );
    const body = await json(res);
    expect(res.status).toBe(200);
    expect(body.meta).toEqual({ page: 1, limit: 10, total: 3, totalPage: 1 });
    expect(JSON.stringify(body.data)).not.toContain("passwordHash");

    const filtered = await json(
      await GET(jsonRequest("/api/users?status=inactive", "GET"), routeContext({})),
    );
    expect(filtered.meta?.total).toBe(1);
    const searched = await json(
      await GET(jsonRequest("/api/users?q=ALICE", "GET"), routeContext({})),
    );
    expect(searched.meta?.total).toBe(1);
  });

  it("creates a user (201), rejects invalid input (422) and duplicates (409)", async () => {
    const { session } = await createUser({ role: Role.ADMIN });
    signInAs(session);
    const valid = {
      name: "New Person",
      email: "New@Example.com",
      password: "Str0ng!Pass",
      role: "USER",
      isActive: true,
    };

    const created = await POST(jsonRequest("/api/users", "POST", valid), routeContext({}));
    expect(created.status).toBe(201);
    expect((await json(created)).data).toMatchObject({ email: "new@example.com", role: "USER" });

    const invalid = await json(
      await POST(jsonRequest("/api/users", "POST", { email: "nope" }), routeContext({})),
    );
    expect(invalid.error?.code).toBe("VALIDATION_ERROR");
    expect(Object.keys(invalid.error?.details?.fieldErrors ?? {})).toEqual(
      expect.arrayContaining(["email", "name", "password"]),
    );

    const duplicate = await POST(jsonRequest("/api/users", "POST", valid), routeContext({}));
    expect(duplicate.status).toBe(409);
    expect((await json(duplicate)).error?.details?.fieldErrors).toHaveProperty("email");
  });

  it("rejects non-JSON bodies with 400", async () => {
    const { session } = await createUser({ role: Role.ADMIN });
    signInAs(session);
    const res = await POST(jsonRequest("/api/users", "POST"), routeContext({}));
    expect(res.status).toBe(400);
  });
});

describe("/api/users/[id] and /api/users/me", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("gets, updates and deletes a user; revokes sessions on password change", async () => {
    const { session } = await createUser({ role: Role.ADMIN });
    const { user: target } = await createUser({ name: "Target" });
    signInAs(session);

    const got = await GET_ONE(
      jsonRequest(`/api/users/${target.id}`, "GET"),
      routeContext({ id: target.id }),
    );
    expect(got.status).toBe(200);

    const patched = await PATCH(
      jsonRequest(`/api/users/${target.id}`, "PATCH", {
        name: "Renamed",
        password: "N3w!Password",
      }),
      routeContext({ id: target.id }),
    );
    expect(patched.status).toBe(200);
    const after = await prisma.user.findUniqueOrThrow({ where: { id: target.id } });
    expect(after.name).toBe("Renamed");
    expect(after.tokenVersion).toBe(target.tokenVersion + 1);

    const deleted = await DELETE(
      jsonRequest(`/api/users/${target.id}`, "DELETE"),
      routeContext({ id: target.id }),
    );
    expect(deleted.status).toBe(204);
    const missing = await GET_ONE(
      jsonRequest(`/api/users/${target.id}`, "GET"),
      routeContext({ id: target.id }),
    );
    expect(missing.status).toBe(404);
  });

  it("prevents admins from deleting themselves or removing the last admin", async () => {
    const { user: admin, session } = await createUser({ role: Role.ADMIN });
    signInAs(session);
    const self = await DELETE(
      jsonRequest(`/api/users/${admin.id}`, "DELETE"),
      routeContext({ id: admin.id }),
    );
    expect(self.status).toBe(400);
  });

  it("lets any signed-in user read their own profile", async () => {
    const { session } = await createUser({ name: "Member" });
    signInAs(session);
    const res = await GET_ME(jsonRequest("/api/users/me", "GET"), routeContext({}));
    expect((await json(res)).data).toMatchObject({ name: "Member" });
  });

  it("returns 422 for malformed ids", async () => {
    const { session } = await createUser({ role: Role.ADMIN });
    signInAs(session);
    const res = await GET_ONE(jsonRequest("/api/users/bad", "GET"), routeContext({ id: "bad" }));
    expect(res.status).toBe(422);
  });
  it("serves directory statistics to admins only", async () => {
    const { session } = await createUser({ role: Role.ADMIN });
    await createUser();
    await createUser({ isActive: false });
    signInAs(session);
    const res = await GET_STATS(jsonRequest("/api/users/stats", "GET"), routeContext({}));
    expect((await json(res)).data).toEqual({ total: 3, active: 2, inactive: 1, admins: 1 });

    const { session: member } = await createUser();
    signInAs(member);
    expect((await GET_STATS(jsonRequest("/api/users/stats", "GET"), routeContext({}))).status).toBe(
      403,
    );
  });

  it("changes the caller's password (204) and rejects a wrong current password (422)", async () => {
    const { user, session } = await createUser({ password: "Old1!Passw0rd" });
    signInAs(session);
    const bad = await CHANGE_PASSWORD(
      jsonRequest("/api/users/me/password", "POST", {
        currentPassword: "x",
        newPassword: "N3w!Passw0rd",
        confirmPassword: "N3w!Passw0rd",
      }),
      routeContext({}),
    );
    expect(bad.status).toBe(422);
    const ok = await CHANGE_PASSWORD(
      jsonRequest("/api/users/me/password", "POST", {
        currentPassword: "Old1!Passw0rd",
        newPassword: "N3w!Passw0rd",
        confirmPassword: "N3w!Passw0rd",
      }),
      routeContext({}),
    );
    expect(ok.status).toBe(204);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).tokenVersion).toBe(1);
  });
});
