import { cacheLife } from "next/cache";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "./container";
import { LogoMark } from "./logo";
import { ThemeToggle } from "./theme-toggle";

// eslint-disable-next-line @typescript-eslint/require-await -- "use cache" requires an async function
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const FOOTER_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#security", label: "Security" },
  { href: "/login", label: "Sign in" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="size-6" />
          <p className="text-sm text-muted-foreground">
            © <CopyrightYear /> {siteConfig.name}. All rights reserved.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={siteConfig.links.github}
                rel="noopener noreferrer"
                target="_blank"
                className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
        <ThemeToggle className="sm:hidden" />
      </Container>
    </footer>
  );
}
