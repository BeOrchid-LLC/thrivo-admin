import { expect, test } from "@playwright/test";

/**
 * Smoke E2E: HTTP-level checks that do not depend on client session init timing.
 * Browser OTP flow requires E2E_TEST_EMAIL when the backend is available.
 */
const staffEmail = process.env.E2E_TEST_EMAIL;

test.describe("Thrivo admin smoke", () => {
  test("login route returns the sign-in shell", async ({ request }) => {
    const response = await request.get("/login");
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain("Sign in | Thrivo Admin");
    expect(html).toContain("Admin Dashboard");
  });

  test("dashboard route is reachable", async ({ request }) => {
    const response = await request.get("/dashboard");
    expect(response.status()).toBe(200);
  });

  test("staff can request an OTP code in the browser", async ({ page, context }) => {
    test.skip(!staffEmail, "Set E2E_TEST_EMAIL to run OTP login smoke.");

    await context.route(/\/api\/v1\/admin\//, async (route) => {
      const url = route.request().url();
      if (url.includes("/auth/session")) {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: "UNAUTHENTICATED", message: "No active session" },
          }),
        });
        return;
      }
      if (url.includes("/auth/request-otp")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { ok: true } }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel("Email")).toBeVisible({ timeout: 30_000 });
    await page.getByLabel("Email").fill(staffEmail!);
    await page.getByRole("button", { name: "Send code" }).click();
    await expect(page.getByText("Enter the code sent to")).toBeVisible();
  });
});
