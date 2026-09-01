import { expect, test } from "@playwright/test";

/**
 * Smoke E2E: HTTP-level checks that do not depend on client session init timing.
 * Authenticated operational coverage lives in authenticated-actions.spec.ts
 * and requires an explicitly supplied Clerk storage state.
 */

test.describe("Thrivo admin smoke", () => {
  test("login route returns the sign-in shell", async ({ request }) => {
    const response = await request.get("/login");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain("Sign in | Thrivo Admin");
    expect(html).toContain("Admin Dashboard");
  });

  test("protected dashboard is not publicly accessible", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    // A server-side guard may redirect or return a Clerk development 404. In
    // dev mode, Next can also return the protected client shell while Clerk
    // resolves the session; the important boundary is that protected content
    // is never rendered for an unauthenticated browser.
    await expect(page.getByRole("heading", { name: "Overview" })).not.toBeVisible({
      timeout: 5_000,
    });
  });
});
