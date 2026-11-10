import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { marketingNav } from "@/config/site";
import { Container } from "./container";
import { HeaderAuthSlot } from "./header-auth-slot";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

/** Public site header. Static except for the streamed auth slot. */
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70"
      style={{ viewTransitionName: "site-header" }}
    >
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {marketingNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Suspense fallback={<Skeleton className="h-9 w-20 rounded-md" />}>
            <HeaderAuthSlot />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
