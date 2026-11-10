"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { PAGE_SIZES, type ListUsersQuery } from "../user.schema";
import { usersHref } from "../user.url";

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
];
const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

/**
 * Filter bar. Updates the URL (navigation, not a fetch) inside a transition;
 * the server component re-renders the table from the new search params.
 */
export function UserFilters({ query }: { query: ListUsersQuery }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.q ?? "");

  function navigate(overrides: Partial<ListUsersQuery>) {
    startTransition(() => {
      router.replace(usersHref(query, { ...overrides, page: 1 }), { scroll: false });
    });
  }
  const debouncedSearch = useDebouncedCallback((q: string) => {
    navigate({ q: q || undefined });
  }, 350);

  const hasFilters = Boolean(query.q ?? query.role ?? query.status);

  return (
    <search className="flex flex-col gap-3 lg:flex-row lg:items-center" aria-busy={isPending}>
      <div className="relative flex-1">
        <label htmlFor="user-search" className="sr-only">
          Search users
        </label>
        <Input
          id="user-search"
          type="search"
          value={search}
          placeholder="Search by name or email…"
          startAdornment={<Search />}
          endAdornment={isPending ? <Spinner className="mr-2" label="Updating results" /> : null}
          onChange={(event) => {
            setSearch(event.target.value);
            debouncedSearch(event.target.value);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
        <Select
          aria-label="Filter by role"
          className="sm:w-36"
          options={ROLE_OPTIONS}
          value={query.role ?? ""}
          onValueChange={(role) => {
            navigate({ role: (role || undefined) as ListUsersQuery["role"] });
          }}
        />
        <Select
          aria-label="Filter by status"
          className="sm:w-36"
          options={STATUS_OPTIONS}
          value={query.status ?? ""}
          onValueChange={(status) => {
            navigate({ status: (status || undefined) as ListUsersQuery["status"] });
          }}
        />
        <NativeSelect
          aria-label="Rows per page"
          className="sm:w-28"
          value={String(query.limit)}
          options={PAGE_SIZES.map((n) => ({ value: String(n), label: `${String(n)} / page` }))}
          onChange={(event) => {
            navigate({ limit: Number(event.target.value) });
          }}
        />
        {hasFilters ? (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              startTransition(() => {
                router.replace(pathname, { scroll: false });
              });
            }}
          >
            <X aria-hidden="true" /> Clear
          </Button>
        ) : null}
      </div>
    </search>
  );
}
