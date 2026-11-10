import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? "admin@example.com",
  password: process.env.ADMIN_PASSWORD ?? "Admin@12345",
};
export const MEMBER = {
  email: "e2e.member@example.com",
  password: "Member@12345",
  name: "E2E Member",
};

export const STORAGE = { admin: "e2e/.auth/admin.json", member: "e2e/.auth/member.json" } as const;

/** Fails the test on any WCAG 2.1 A/AA violation. */
export async function expectNoA11yViolations(page: Page) {
  // Scan the settled UI, not a frame mid-transition.
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running"),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary, "accessibility violations").toEqual([]);
}

export async function signIn(page: Page, { email, password }: { email: string; password: string }) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: false }).first().fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
