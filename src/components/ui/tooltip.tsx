"use client";

import { cn } from "cn";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type Side = "top" | "bottom" | "left" | "right";

type TooltipProps = {
  content: ReactNode;
  side?: Side;
  /** The trigger: a single focusable element (button or link). */
  children: ReactNode;
  className?: string;
};

const POSITION: Record<Side, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

const FOCUSABLE = "a[href],button,input,select,textarea,[tabindex]";

/**
 * Lightweight tooltip shown on hover AND keyboard focus (CSS only), dismissible
 * with Esc (WCAG 1.4.13) and linked to its trigger via `aria-describedby`.
 * Accepts server-rendered children (no render prop), so it works in RSC trees.
 * Use for supplementary hints only — never for essential information.
 */
export function Tooltip({ content, side = "top", children, className }: TooltipProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const trigger = wrapperRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    if (!trigger) return;
    const previous = trigger.getAttribute("aria-describedby");
    trigger.setAttribute("aria-describedby", previous ? `${previous} ${id}` : id);
    return () => {
      if (previous) trigger.setAttribute("aria-describedby", previous);
      else trigger.removeAttribute("aria-describedby");
    };
  }, [id]);

  return (
    <span
      ref={wrapperRef}
      className="group/tooltip relative inline-flex"
      onKeyDown={(event) => {
        if (event.key === "Escape") setDismissed(true);
      }}
      onPointerLeave={() => {
        setDismissed(false);
      }}
      onBlur={() => {
        setDismissed(false);
      }}
    >
      {children}
      <span
        role="tooltip"
        id={id}
        data-dismissed={dismissed || undefined}
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-64 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md",
          "invisible opacity-0 transition-[opacity,visibility] delay-0 duration-150",
          "group-focus-within/tooltip:visible group-focus-within/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:opacity-100 group-hover/tooltip:delay-300",
          "data-dismissed:invisible! data-dismissed:opacity-0!",
          POSITION[side],
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
