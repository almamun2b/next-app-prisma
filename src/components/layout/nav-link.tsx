"use client";

import { cn } from "cn";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = {
  href: Route;
  children: ReactNode;
  className?: string;
  /** Match nested routes too (e.g. /users/123 activates /users). */
  matchNested?: boolean;
  variant?: "top" | "side";
};

/** Navigation link with an active state (`aria-current="page"`). */
export function NavLink({
  href,
  children,
  className,
  matchNested = true,
  variant = "top",
}: NavLinkProps) {
  const pathname = usePathname();
  const path = href.split("#")[0] ?? href;
  const isActive =
    pathname === path || (matchNested && path !== "/" && pathname.startsWith(`${path}/`));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-md text-sm font-medium transition-colors [&_svg]:size-4",
        variant === "top" &&
          "px-3 py-2 text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground",
        variant === "side" &&
          "w-full px-3 py-2.5 text-muted-foreground hover:bg-accent hover:text-foreground aria-[current=page]:bg-secondary aria-[current=page]:text-secondary-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}
