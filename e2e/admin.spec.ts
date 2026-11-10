import { expect, test } from "@playwright/test";
import { expectNoA11yViolations, STORAGE } from "./fixtures";

test.use({ storageState: STORAGE.admin });

test.describe("admin user management", () => {
  test("dashboard shows directory statistics", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back");
    await expect(page.getByRole("region", { name: "User statistics" })).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test("create, search, edit, deactivate and delete a user", async ({ page }) => {
    const email = `e2e.created.${String(Date.now())}@example.com`;
    await page.goto("/users");
    await expectNoA11yViolations(page);

    // Create (with a server-validated weak password first)
    await page.getByRole("button", { name: "New user" }).click();
    const dialog = page.getByRole("dialog", { name: "Create user" });
    await dialog.getByLabel("Full name").fill("E2E Created");
    await dialog.getByLabel("Email").fill(email);
    await dialog.getByLabel("Password", { exact: false }).first().fill("weak");
    await dialog.getByRole("button", { name: "Create user" }).click();
    await expect(dialog.getByText("Password must be at least 8 characters")).toBeVisible();
    await dialog.getByLabel("Password", { exact: false }).first().fill("Str0ng!Pass");
    await dialog.getByRole("button", { name: "Create user" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("User created")).toBeVisible();

    // Search (URL-driven)
    await page.getByRole("searchbox", { name: "Search users" }).fill(email);
    await expect(page).toHaveURL(/q=e2e\.created/);
    await expect(page.getByRole("row")).toHaveCount(2);

    // Deactivate inline (optimistic switch)
    const toggle = page.getByRole("switch", { name: "Active status for E2E Created" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(page.getByText("E2E Created deactivated")).toBeVisible();

    // Edit
    await page.getByRole("link", { name: "Edit E2E Created" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "E2E Created" })).toBeVisible();
    await page.getByLabel("Full name").fill("E2E Renamed");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("User updated")).toBeVisible();
    await expectNoA11yViolations(page);

    // Delete (requires explicit confirmation)
    await page.getByRole("button", { name: "Delete user" }).click();
    const confirm = page.getByRole("dialog", { name: "Delete user?" });
    const deleteButton = confirm.getByRole("button", { name: "Delete permanently" });
    await expect(deleteButton).toBeDisabled();
    await confirm.getByLabel("I understand this cannot be undone").check();
    await deleteButton.click();
    await expect(page).toHaveURL(/\/users$/);
  });

  test("filters with the keyboard-accessible custom select", async ({ page }) => {
    await page.goto("/users");
    const role = page.getByRole("combobox", { name: "Filter by role" });
    await role.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/role=ADMIN/);
    await expect(
      page.getByRole("row").filter({ hasText: "User" }).filter({ hasNotText: "Admin" }),
    ).toHaveCount(1);
  });

  test("profile and component gallery are accessible", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Profile" })).toBeVisible();
    await expectNoA11yViolations(page);
    await page.goto("/design-system");
    await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();
    await expectNoA11yViolations(page);
  });
});
