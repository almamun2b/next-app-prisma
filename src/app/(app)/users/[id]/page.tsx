import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAppError } from "@/lib/errors";
import { formatDateTime } from "@/lib/format";
import { requireAdmin } from "@/modules/auth/auth.guard";
import { DeleteUserButton } from "@/modules/user/components/delete-user-button";
import { RoleBadge, StatusBadge } from "@/modules/user/components/user-badges";
import { UserForm } from "@/modules/user/components/user-form";
import { userIdSchema } from "@/modules/user/user.schema";
import { userService } from "@/modules/user/user.service";

export const metadata: Metadata = { title: "Edit user" };

async function loadUser(rawId: string) {
  const admin = await requireAdmin();
  const id = userIdSchema.safeParse(rawId);
  if (!id.success) notFound();
  try {
    return await userService.getById(admin, id.data);
  } catch (error) {
    if (isAppError(error) && error.statusCode === 404) notFound();
    throw error;
  }
}

async function UserDetailPageContent({ params }: PageProps<"/users/[id]">) {
  const user = await loadUser((await params).id);

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <Link
        href="/users"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to users
      </Link>

      <header className="flex flex-wrap items-center gap-4">
        <Avatar name={user.name} src={user.image} size="lg" />
        <div className="grid gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {user.email}
            <RoleBadge role={user.role} />
            <StatusBadge isActive={user.isActive} />
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Last sign-in: {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "never"} · Created{" "}
            {formatDateTime(user.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            mode="edit"
            userId={user.id}
            defaultValues={{
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Deleting a user removes their account and signs them out immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteUserButton user={user} variant="button" redirectTo="/users" />
        </CardContent>
      </Card>
    </div>
  );
}

/** Each page owns a Suspense boundary so client navigations stay instant. */
export default function UserDetailPage(props: PageProps<"/users/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <UserDetailPageContent {...props} />
    </Suspense>
  );
}
