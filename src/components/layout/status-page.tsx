import type { Route } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "./logo";

type StatusPageProps = {
  code: string;
  title: string;
  description: string;
  action?: { href: Route; label: string };
};

/** Shared layout for 401 / 403 / 404 pages. */
export function StatusPage({
  code,
  title,
  description,
  action = { href: "/", label: "Go home" },
}: StatusPageProps) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-16 text-center">
      <div className="grid max-w-md animate-slide-up justify-items-center gap-5">
        <LogoMark className="size-10" />
        <p className="font-mono text-sm font-semibold text-primary">{code}</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <Link href={action.href} className={buttonVariants({ variant: "outline" })}>
          {action.label}
        </Link>
      </div>
    </main>
  );
}
