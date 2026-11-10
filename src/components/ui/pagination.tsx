import { cn } from "cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants } from "./button";

type Href = ComponentProps<typeof Link>["href"];

type PaginationProps = {
  page: number;
  totalPages: number;
  /** Builds the URL for a page (keeps other search params intact). */
  hrefForPage: (page: number) => Href;
  className?: string;
};

/** Page numbers to render, with `null` for an ellipsis gap. */
export function getPageWindow(page: number, totalPages: number, siblings = 1): (number | null)[] {
  if (totalPages <= 5 + siblings * 2) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);
  const pages: (number | null)[] = [1];
  if (start > 2) pages.push(null);
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push(null);
  pages.push(totalPages);
  return pages;
}

const itemClass = buttonVariants({ variant: "ghost", size: "icon-sm" });

/**
 * Link-based pagination (server-rendered, crawlable, works without JS).
 * Current page is marked with `aria-current="page"`.
 */
export function Pagination({ page, totalPages, hrefForPage, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}>
      {hasPrev ? (
        <Link
          href={hrefForPage(page - 1)}
          className={itemClass}
          aria-label="Previous page"
          scroll={false}
        >
          <ChevronLeft aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(itemClass, "opacity-40")} aria-hidden="true">
          <ChevronLeft />
        </span>
      )}

      <ul className="flex items-center gap-1">
        {getPageWindow(page, totalPages).map((p, i) =>
          p === null ? (
            <li key={`gap-${String(i)}`} aria-hidden="true" className="px-1 text-muted-foreground">
              …
            </li>
          ) : (
            <li key={p} className="hidden sm:block">
              <Link
                href={hrefForPage(p)}
                scroll={false}
                aria-label={`Page ${String(p)}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  itemClass,
                  "tabular-nums aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground",
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        <li className="px-2 text-sm text-muted-foreground tabular-nums sm:hidden">
          {page} / {totalPages}
        </li>
      </ul>

      {hasNext ? (
        <Link
          href={hrefForPage(page + 1)}
          className={itemClass}
          aria-label="Next page"
          scroll={false}
        >
          <ChevronRight aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(itemClass, "opacity-40")} aria-hidden="true">
          <ChevronRight />
        </span>
      )}
    </nav>
  );
}
