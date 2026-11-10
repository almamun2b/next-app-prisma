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

  test("client-side validation runs before submitting", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
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
