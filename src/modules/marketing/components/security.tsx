import { Check } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";

const PRACTICES = [
  "Passwords hashed with bcrypt and never returned by any endpoint",
  "Sessions revoked instantly on password, role or status change",
  "Sign-in rate limiting and timing-safe credential checks",
  "Strict security headers: CSP, HSTS, frame and referrer policies",
  "Validated input on every request with shared schemas",
  "Consistent, non-leaking error responses across the API",
] as const;

export function Security() {
  return (
    <section id="security" aria-labelledby="security-title" className="scroll-mt-20 py-20 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-4">
          <p className="text-sm font-semibold text-primary">Security</p>
          <h2 id="security-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Secure by design, not by checklist.
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Access decisions happen on the server, in one place, for every request. The browser
            never talks to the database or the API directly.
          </p>
          <Link href="/login" className={buttonVariants({ className: "mt-2 w-fit" })}>
            Sign in securely
          </Link>
        </div>
        <ul className="grid gap-4">
          {PRACTICES.map((practice) => (
            <li
              key={practice}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-sm"
            >
              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
              </span>
              {practice}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
