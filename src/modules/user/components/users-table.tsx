import { Pencil, UsersRound } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  SortableHead,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { formatDate, formatRelative } from "@/lib/format";
import type { PublicUser } from "../user.dto";
import type { ListUsersQuery } from "../user.schema";
import { usersHref } from "../user.url";
import { RoleBadge } from "./user-badges";
import { DeleteUserButton } from "./delete-user-button";
import { UserStatusSwitch } from "./user-status-switch";

type Column = { key: ListUsersQuery["sort"]; label: string; className?: string };
const COLUMNS: Column[] = [
  { key: "name", label: "User" },
  { key: "role", label: "Role" },
  { key: "lastLoginAt", label: "Last sign-in", className: "hidden md:table-cell" },
  { key: "createdAt", label: "Created", className: "hidden lg:table-cell" },
];

export function UsersTable({ users, query }: { users: PublicUser[]; query: ListUsersQuery }) {
  if (users.length === 0) {
    return (
      <div className="grid justify-items-center gap-3 px-6 py-16 text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-muted">
          <UsersRound aria-hidden="true" className="size-6 text-muted-foreground" />
        </span>
        <p className="font-medium">No users match your filters</p>
        <p className="text-sm text-muted-foreground">
          Try a different search or clear the filters.
        </p>
      </div>
    );
  }

  const sortHref = (key: Column["key"]) =>
    usersHref(query, {
      sort: key,
      order: query.sort === key && query.order === "asc" ? "desc" : "asc",
    });

  return (
    <Table label="Users">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {COLUMNS.map((col) => (
            <SortableHead
              key={col.key}
              label={col.label}
              href={sortHref(col.key)}
              direction={query.sort === col.key ? query.order : false}
              className={col.className}
            />
          ))}
          <TableHead>Active</TableHead>
          <TableHead className="text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={user.name} src={user.image} size="sm" />
                <div className="grid min-w-0">
                  <Link href={`/users/${user.id}`} className="truncate font-medium hover:underline">
                    {user.name}
                  </Link>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <RoleBadge role={user.role} />
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">
              {user.lastLoginAt ? (
                <time dateTime={user.lastLoginAt.toISOString()}>
                  {formatRelative(user.lastLoginAt)}
                </time>
              ) : (
                "Never"
              )}
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
              <time dateTime={user.createdAt.toISOString()}>{formatDate(user.createdAt)}</time>
            </TableCell>
            <TableCell>
              <UserStatusSwitch user={user} />
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Tooltip content="Edit user">
                  <Link
                    href={`/users/${user.id}`}
                    aria-label={`Edit ${user.name}`}
                    className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                  >
                    <Pencil aria-hidden="true" />
                  </Link>
                </Tooltip>
                <DeleteUserButton user={user} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
