import { cn } from "cn";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M11 8v16M11 16l9-8M14.5 13l6 11"
        className="stroke-primary-foreground"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: "/" | "/dashboard"; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md text-base font-semibold tracking-tight",
        className,
      )}
    >
      <LogoMark />
      <span>{siteConfig.name}</span>
      <span className="sr-only">— home</span>
    </Link>
  );
}
