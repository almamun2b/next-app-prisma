import { expect, test as setup } from "@playwright/test";
import { ADMIN, MEMBER, STORAGE, signIn } from "./fixtures";

setup("authenticate as admin", async ({ page }) => {
  await signIn(page, ADMIN);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.context().storageState({ path: STORAGE.admin });
});

setup("authenticate as member", async ({ page }) => {
  await signIn(page, MEMBER);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.context().storageState({ path: STORAGE.member });
});
