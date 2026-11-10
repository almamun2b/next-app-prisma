import type { Route } from "next";
import type { ListUsersQuery } from "./user.schema";

const DEFAULTS: Partial<Record<keyof ListUsersQuery, string>> = {
  page: "1",
  limit: "10",
  sort: "createdAt",
  order: "desc",
};

/**
 * Builds a `/users` URL from the current list query plus overrides, omitting
 * default values so URLs stay short and shareable.
 */
export function usersHref(
  query: Partial<ListUsersQuery>,
  overrides: Partial<ListUsersQuery> = {},
): Route {
  const merged = { ...query, ...overrides };
  const params = new URLSearchParams();
  // Values may be explicitly `undefined` at runtime (cleared filters).
  for (const [key, value] of Object.entries(merged) as [string, string | number | undefined][]) {
    if (value === undefined) continue;
    const str = String(value);
    if (DEFAULTS[key as keyof ListUsersQuery] === str) continue;
    params.set(key, str);
  }
  const qs = params.toString();
  return qs ? `/users?${qs}` : "/users";
}
