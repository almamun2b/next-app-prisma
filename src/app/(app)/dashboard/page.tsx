import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Suspense } from "react";
import { ArrowRight, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatDateTime } from "@/lib/format";
import { isAdmin, requireUser } from "@/modules/auth/auth.guard";
import type { SessionUser } from "@/modules/auth/auth.types";
import { RoleBadge, StatusBadge } from "@/modules/user/components/user-badges";
import { StatCard } from "@/modules/user/components/stat-card";
import { userService } from "@/modules/user/user.service";

export const metadata: Metadata = { title: "Dashboard" };

async function AdminOverview({ user }: { user: SessionUser }) {
  const [stats, recent] = await Promise.all([userService.stats(user), userService.recent(user, 5)]);
  return (
    <>
      <section aria-label="User statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={stats.total} icon={Users} />
        <StatCard label="Active" value={stats.active} icon={UserCheck} />
        <StatCard label="Inactive" value={stats.inactive} icon={UserX} hint="Cannot sign in" />
        <StatCard label="Administrators" value={stats.admins} icon={ShieldCheck} />
      </section>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="grid gap-1">
            <CardTitle>Recently added</CardTitle>
            <CardDescription>The newest accounts in your directory.</CardDescription>
          </div>
          <Link href="/users" className={buttonVariants({ variant: "outline", size: "sm" })}>
            All users <ArrowRight aria-hidden="true" />
          </Link>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {recent.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={u.name} src={u.image} size="sm" />
                  <div className="grid min-w-0">
                    <Link
                      href={`/users/${u.id}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {u.name}
                    </Link>
                    <span className="truncate text-xs text-muted-foreground">{u.email}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <RoleBadge role={u.role} />
                  <time
                    dateTime={u.createdAt.toISOString()}
                    className="hidden text-xs text-muted-foreground sm:block"
                  >
                    {formatDate(u.createdAt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}

async function MemberOverview({ user }: { user: SessionUser }) {
  const profile = await userService.getProfile(user);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your account</CardTitle>
        <CardDescription>Details your administrator manages for you.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Role</dt>
            <dd>
              <RoleBadge role={profile.role} />
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge isActive={profile.isActive} />
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Member since</dt>
            <dd>{formatDate(profile.createdAt)}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="text-muted-foreground">Last sign-in</dt>
            <dd>{profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : "—"}</dd>
          </div>
        </dl>
        <Link href="/profile" className={buttonVariants({ variant: "outline", className: "mt-6" })}>
          Edit profile
        </Link>
      </CardContent>
    </Card>
  );
}

async function DashboardPageContent() {
  const user = await requireUser();
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8">
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0] ?? user.name}`}
        description={
          isAdmin(user)
            ? "Here's what's happening across your directory."
            : "Here's an overview of your account."
        }
      />
      {isAdmin(user) ? <AdminOverview user={user} /> : <MemberOverview user={user} />}
    </div>
  );
}

/** Each page owns a Suspense boundary so client navigations stay instant. */
export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}
