import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUser } from "@/modules/auth/auth.guard";
import { UserMenu } from "./user-menu";

/**
 * Session-dependent part of the public header. Rendered inside <Suspense> so
 * the rest of the page stays in the static shell.
 */
export async function HeaderAuthSlot() {
  const user = await getSessionUser();
  if (user) return <UserMenu user={user} />;
  return (
    <Link href="/login" className={buttonVariants({ size: "sm" })}>
      Sign in
    </Link>
  );
}
