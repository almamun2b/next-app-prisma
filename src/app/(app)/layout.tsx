import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AppAuthGate } from "@/components/layout/app-auth-gate";
import { AppNav, AppNavSkeleton } from "@/components/layout/app-nav";
import { AppTopbarUser } from "@/components/layout/app-topbar-user";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSkeleton } from "@/components/layout/page-skeleton";

/** Authenticated area — never indexed. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-border bg-surface px-4 py-5 lg:flex">
        <Logo href="/dashboard" className="px-2" />
        <nav aria-label="Main" className="flex-1">
          <Suspense fallback={<AppNavSkeleton />}>
            <AppNav />
          </Suspense>
        </nav>
        <ThemeToggle className="self-start" />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Logo href="/dashboard" className="lg:invisible" />
            <div className="flex items-center gap-3">
              <ThemeToggle className="hidden sm:inline-flex lg:hidden" />
              <Suspense fallback={<Skeleton className="size-9 rounded-full" />}>
                <AppTopbarUser />
              </Suspense>
            </div>
          </div>
          <nav aria-label="Main" className="border-t border-border px-2 py-1.5 lg:hidden">
            <Suspense fallback={<Skeleton className="h-9 w-64" />}>
              <AppNav orientation="horizontal" />
            </Suspense>
          </nav>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="flex-1 px-4 py-8 focus:outline-none sm:px-6 lg:px-8"
        >
          <Suspense fallback={<PageSkeleton />}>
            <AppAuthGate>{children}</AppAuthGate>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
