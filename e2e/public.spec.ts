import { expect, test } from "@playwright/test";
import { expectNoA11yViolations } from "./fixtures";

test.describe("public pages", () => {
  test("landing page is server-rendered with SEO metadata and structured data", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Keystone/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Manage every account with confidence.",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /user management/i,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /^https?:\/\/[^/]+\/?$/,
    );
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    const types = (JSON.parse(jsonLd ?? "[]") as { "@type": string }[]).map((d) => d["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite"]));
    await expectNoA11yViolations(page);
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await skip.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("login page is accessible in light and dark mode", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expectNoA11yViolations(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoA11yViolations(page);
  });

  test("robots.txt and sitemap.xml are served", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /dashboard");
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.headers()["content-type"]).toContain("xml");
  });

  test("security headers are set", async ({ request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});
