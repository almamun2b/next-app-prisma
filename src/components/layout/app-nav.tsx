import { cn } from "cn";
import { LayoutDashboard, Palette, UserRound, Users } from "lucide-react";
import { getSessionUser, isAdmin } from "@/modules/auth/auth.guard";
import { NavLink } from "./nav-link";

/** Primary app navigation; admin-only entries are omitted for regular users. */
export async function AppNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const user = await getSessionUser();
  const vertical = orientation === "vertical";
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/users", label: "Users", icon: Users, show: isAdmin(user) },
    { href: "/profile", label: "Profile", icon: UserRound, show: true },
    { href: "/design-system", label: "Components", icon: Palette, show: true },
  ] as const;

  return (
    <ul className={cn("flex gap-1", vertical ? "flex-col" : "overflow-x-auto")}>
      {items
        .filter((item) => item.show)
        .map(({ href, label, icon: Icon }) => (
          <li key={href} className="shrink-0">
            <NavLink href={href} variant={vertical ? "side" : "top"}>
              <Icon aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
    </ul>
  );
}

export function AppNavSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-2" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-md bg-subtle motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}
