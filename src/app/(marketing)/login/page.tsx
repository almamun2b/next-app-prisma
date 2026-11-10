import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { LogoMark } from "@/components/layout/logo";
import { JsonLd, webPageJsonLd } from "@/components/seo/json-ld";
import { Card, CardContent } from "@/components/ui/card";
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

/** Optional, request-dependent notice — streamed so the form stays in the static shell. */
async function LoginNotice({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { reason } = await searchParams;
  const notice = typeof reason === "string" ? NOTICES[reason] : undefined;
  if (!notice) return null;
  return (
    <p
      role="status"
      className="rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-secondary-foreground"
    >
      {notice}
    </p>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Container className="flex justify-center py-16 sm:py-24">
      <JsonLd data={webPageJsonLd({ name: "Sign in", path: "/login" })} />
      <div className="grid w-full max-w-sm gap-8">
        <header className="grid justify-items-center gap-4 text-center">
          <LogoMark className="size-10" />
          <div className="grid gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with the account your administrator created.
            </p>
          </div>
        </header>
        <Suspense fallback={null}>
          <LoginNotice searchParams={searchParams} />
        </Suspense>
        <Card>
          <CardContent>
            {/* Static shell: the form is interactive before (and without) hydration. */}
            <LoginForm />
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          No account? Accounts are created by an administrator.
        </p>
      </div>
    </Container>
  );
}
