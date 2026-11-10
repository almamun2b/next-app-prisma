import { getSessionUser } from "@/modules/auth/auth.guard";
import { UserMenu } from "./user-menu";

export async function AppTopbarUser() {
  const user = await getSessionUser();
  return user ? <UserMenu user={user} /> : null;
}
