import { expect, test } from "@playwright/test";
import { MEMBER, STORAGE } from "./fixtures";

test.use({ storageState: STORAGE.member });

test.describe("member (non-admin) access control", () => {
  test("sees a personal dashboard without admin navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Your account" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Users" }),
    ).toHaveCount(0);
  });

  test("is redirected away from admin pages", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("gets 403 from admin API endpoints but can read own profile", async ({ page }) => {
    await page.goto("/dashboard");
    expect((await page.request.get("/api/users")).status()).toBe(403);
    const me = await page.request.get("/api/users/me");
    expect(me.status()).toBe(200);
    expect(((await me.json()) as { data: { email: string } }).data.email).toBe(MEMBER.email);
  });
});
