import "server-only";
import { apiRequest } from "@/lib/http/api-client";
import type { PaginationMeta } from "@/lib/http/api-response";
import type { PublicUser, UserStats } from "./user.dto";
import type {
  ChangePasswordInput,
  CreateUserInput,
  ListUsersQuery,
  UpdateProfileInput,
  UpdateUserInput,
} from "./user.schema";

/** JSON form of PublicUser: Dates arrive as ISO strings. */
type SerializedUser = Omit<PublicUser, "createdAt" | "updatedAt" | "lastLoginAt"> & {
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export function reviveUser(raw: SerializedUser): PublicUser {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    lastLoginAt: raw.lastLoginAt ? new Date(raw.lastLoginAt) : null,
  };
}

/**
 * View-layer gateway to the users REST API. Pages, Server Components and
 * Server Actions use this — never `userService` or `userRepository`.
 */
export const usersApi = {
  async list(query: ListUsersQuery): Promise<{ data: PublicUser[]; meta: PaginationMeta }> {
    const { data, meta } = await apiRequest<SerializedUser[]>("/api/users", { query });
    return {
      data: data.map(reviveUser),
      meta: meta ?? { page: query.page, limit: query.limit, total: data.length, totalPage: 1 },
    };
  },

  async get(id: string): Promise<PublicUser> {
    return reviveUser((await apiRequest<SerializedUser>(`/api/users/${id}`)).data);
  },

  async create(input: Required<CreateUserInput>): Promise<PublicUser> {
    return reviveUser(
      (await apiRequest<SerializedUser>("/api/users", { method: "POST", body: input })).data,
    );
  },

  async update(id: string, input: UpdateUserInput): Promise<PublicUser> {
    const { data } = await apiRequest<SerializedUser>(`/api/users/${id}`, {
      method: "PATCH",
      body: input,
    });
    return reviveUser(data);
  },

  async remove(id: string): Promise<void> {
    await apiRequest(`/api/users/${id}`, { method: "DELETE" });
  },

  /** Newest accounts (admin). Uses the list endpoint; no dedicated route needed. */
  async recent(count = 5): Promise<PublicUser[]> {
    const { data } = await usersApi.list({ page: 1, limit: 10, sort: "createdAt", order: "desc" });
    return data.slice(0, count);
  },

  async stats(): Promise<UserStats> {
    return (await apiRequest<UserStats>("/api/users/stats")).data;
  },

  async me(): Promise<PublicUser> {
    return reviveUser((await apiRequest<SerializedUser>("/api/users/me")).data);
  },

  async updateMe(input: Required<UpdateProfileInput>): Promise<PublicUser> {
    const { data } = await apiRequest<SerializedUser>("/api/users/me", {
      method: "PATCH",
      body: input,
    });
    return reviveUser(data);
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await apiRequest("/api/users/me/password", { method: "POST", body: input });
  },
};
