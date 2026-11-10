import { expect, test } from "@playwright/test";
import { ADMIN, signIn } from "./fixtures";

test.describe("authentication", () => {
  test("protected pages redirect to login and return after sign-in", async ({ page }) => {
    await page.goto("/users?page=2");
    await expect(page).toHaveURL(/\/login\?.*callbackUrl=/);
    await page.getByLabel("Email").fill(ADMIN.email);
    await page.getByLabel("Password", { exact: false }).first().fill(ADMIN.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/users\?page=2$/);
  });

  test("invalid credentials show an accessible error", async ({ page }) => {
    await signIn(page, { email: ADMIN.email, password: "Wrong-password1!" });
    // Next.js also renders a (empty) route announcer with role="alert".
    await expect(page.getByRole("alert").filter({ hasText: "Invalid" })).toHaveText(
      "Invalid email or password.",
    );
    await expect(page).toHaveURL(/\/login/);
  });

  test("native validation blocks empty submits before reaching the server", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    const email = page.getByLabel("Email");
    expect(await email.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("login works before hydration / without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/login");
    await page.getByLabel("Email").fill(ADMIN.email);
    await page.getByLabel("Password", { exact: false }).first().fill(ADMIN.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await context.close();
  });

  test("users can sign out from the account menu", async ({ page }) => {
    await signIn(page, ADMIN);
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole("button", { name: /Account menu/ }).click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
