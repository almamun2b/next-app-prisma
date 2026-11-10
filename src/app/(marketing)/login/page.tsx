import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/logo";
import { JsonLd, webPageJsonLd } from "@/components/seo/json-ld";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buildMetadata } from "@/lib/seo";
import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to the Keystone user management console.",
  path: "/login",
});

const NOTICES: Record<string, string> = {
  "password-changed": "Your password was changed. Please sign in again.",
};

async function LoginFormLoader({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : undefined;
  const reason = typeof params.reason === "string" ? params.reason : undefined;
  return <LoginForm callbackUrl={callbackUrl} notice={reason ? NOTICES[reason] : undefined} />;
}

function LoginFormSkeleton() {
  return (
    <div className="grid gap-5" aria-hidden="true">
      <Skeleton className="h-16" />
      <Skeleton className="h-16" />
      <Skeleton className="h-11" />
    </div>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <Container className="flex justify-center py-16 sm:py-24">
      <JsonLd data={webPageJsonLd({ name: "Sign in", path: "/login" })} />
      <div className="grid w-full max-w-sm animate-slide-up gap-8">
        <header className="grid justify-items-center gap-4 text-center">
          <LogoMark className="size-10" />
          <div className="grid gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with the account your administrator created.
            </p>
          </div>
        </header>
        <Card>
          <CardContent>
            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginFormLoader {...props} />
            </Suspense>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          No account? Accounts are created by an administrator.
        </p>
      </div>
    </Container>
  );
}
