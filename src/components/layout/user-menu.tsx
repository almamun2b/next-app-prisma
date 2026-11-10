"use client";

import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useId, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
import { logoutAction } from "@/modules/auth/auth.actions";
import type { SessionUser } from "@/modules/auth/auth.types";

const itemClass =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none [&_svg]:size-4 [&_svg]:text-muted-foreground";

/**
 * Account menu using the native Popover API (top layer, light-dismiss, Esc)
 * — no positioning library. Sign-out is a progressive-enhancement form.
 */
export function UserMenu({ user }: { user: SessionUser }) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function position() {
    const trigger = triggerRef.current?.getBoundingClientRect();
    const menu = menuRef.current;
    if (!trigger || !menu) return;
    menu.style.top = `${String(trigger.bottom + 8)}px`;
    menu.style.left = `${String(Math.max(8, trigger.right - menu.offsetWidth))}px`;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        popoverTarget={id}
        aria-label={`Account menu for ${user.name}`}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-accent"
      >
        <Avatar name={user.name} src={user.image} size="sm" />
        <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
      </button>
      <div
        ref={menuRef}
        id={id}
        popover="auto"
        data-menu=""
        onToggle={(event) => {
          if ((event as unknown as ToggleEvent).newState === "open") position();
        }}
        className="fixed m-0 w-60 rounded-lg border border-border bg-surface p-1.5 text-surface-foreground shadow-lg"
      >
        <div className="border-b border-border px-2.5 pt-1.5 pb-3">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <ul className="grid gap-0.5 py-1.5">
          <li>
            <Link href="/dashboard" className={itemClass}>
              <LayoutDashboard aria-hidden="true" /> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/profile" className={itemClass}>
              <UserRound aria-hidden="true" /> Profile
            </Link>
          </li>
        </ul>
        <form action={logoutAction} className="border-t border-border pt-1.5">
          <button type="submit" className={itemClass}>
            <LogOut aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </>
  );
}
