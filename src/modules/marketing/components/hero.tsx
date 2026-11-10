import { ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--color-primary)_14%,transparent),transparent)]"
      />
      <Container className="grid gap-12 pt-16 pb-20 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        <div className="grid gap-6">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck aria-hidden="true" className="size-3.5 text-primary" />
            Role-based access, built in
          </p>
          <h1
            id="hero-title"
            className="text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem]"
          >
            Manage every account with confidence.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Keystone gives administrators one fast, accessible console to onboard people, assign
            roles and revoke access the moment it matters.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Open the console
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/#features" className={buttonVariants({ size: "lg", variant: "outline" })}>
              See what&apos;s inside
            </Link>
          </div>
        </div>
        <figure className="relative">
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-foreground/10">
            <Image
              src="/images/dashboard-preview.png"
              alt="Keystone users table showing names, roles, status badges and pagination"
              width={1200}
              height={800}
              preload
              sizes="(min-width: 1024px) 540px, 100vw"
              className="h-auto w-full"
            />
          </div>
          <figcaption className="sr-only">
            Preview of the Keystone user management console
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
