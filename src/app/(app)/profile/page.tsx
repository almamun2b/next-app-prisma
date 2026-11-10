import { PageSkeleton } from "@/components/layout/page-skeleton";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/modules/auth/auth.guard";
import { ChangePasswordForm } from "@/modules/user/components/change-password-form";
import { ProfileForm } from "@/modules/user/components/profile-form";
import { userService } from "@/modules/user/user.service";

export const metadata: Metadata = { title: "Profile" };

async function ProfilePageContent() {
  const user = await requireUser();
  const profile = await userService.getProfile(user);

  return (
    <div className="mx-auto grid w-full max-w-3xl animate-fade-in gap-6">
      <PageHeader title="Profile" description="Manage your personal details and password." />
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Your name is visible to administrators.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm defaultValues={{ name: profile.name }} email={profile.email} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            You&apos;ll be signed out of all devices after changing it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

/** Each page owns a Suspense boundary so client navigations stay instant. */
export default function ProfilePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}
