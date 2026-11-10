import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { formatNumber } from "@/lib/format";
import { requireAdmin } from "@/modules/auth/auth.guard";
import { CreateUserButton } from "@/modules/user/components/create-user-button";
import { UserFilters } from "@/modules/user/components/user-filters";
import { UsersTable } from "@/modules/user/components/users-table";
import { listUsersQuerySchema } from "@/modules/user/user.schema";
import { userService } from "@/modules/user/user.service";
import { usersHref } from "@/modules/user/user.url";

export const metadata: Metadata = { title: "Users" };

async function UsersPageContent({ searchParams }: PageProps<"/users">) {
  const admin = await requireAdmin();
  const query = listUsersQuerySchema.parse(await searchParams);
  const { data: users, meta } = await userService.list(admin, query);
  const from = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const to = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="mx-auto grid w-full max-w-6xl animate-fade-in gap-6">
      <PageHeader
        title="Users"
        description="Invite people, assign roles and control access."
        actions={<CreateUserButton />}
      />
      <UserFilters query={query} />
      <Card className="overflow-hidden">
        <UsersTable users={users} query={query} />
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing{" "}
            <span className="font-medium text-foreground tabular-nums">
              {from}–{to}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground tabular-nums">
              {formatNumber(meta.total)}
            </span>{" "}
            users
          </p>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPage}
            hrefForPage={(page) => usersHref(query, { page })}
          />
        </footer>
      </Card>
    </div>
  );
}

/** Each page owns a Suspense boundary so client navigations stay instant. */
export default function UsersPage(props: PageProps<"/users">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UsersPageContent {...props} />
    </Suspense>
  );
}
