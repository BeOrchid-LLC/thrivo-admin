import { expect, test } from "@playwright/test";

/**
 * Clerk owns the authentication UI and all password-recovery/invitation
 * flows. These checks intentionally verify the integration boundary rather
 * than mocking the legacy backend OTP/session endpoints, which the client no
 * longer uses.
 */

const clerkPublishableKey = process.env.E2E_CLERK_PUBLISHABLE_KEY;

test.describe("Clerk authentication shell", () => {
  test.skip(
    !clerkPublishableKey,
    "Set E2E_CLERK_PUBLISHABLE_KEY to run Clerk UI smoke tests against a real instance."
  );

  test("login renders the Clerk sign-in form", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible({ timeout: 20_000 });
  });

  for (const route of ["/forgot-password", "/reset-password", "/accept-invite"]) {
    test(`${route} renders the Clerk recovery/invitation surface`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expect(page.getByPlaceholder("Enter your email")).toBeVisible({ timeout: 20_000 });
    });
  }
});

/**
 * Real Clerk sign-in is opt-in because credentials are environment-specific.
 * CI or a release smoke run can set both variables to exercise a genuine
 * authenticated browser session without putting credentials in the repo.
 */
const clerkEmail = process.env.E2E_CLERK_EMAIL;
const clerkPassword = process.env.E2E_CLERK_PASSWORD;

test("a configured Clerk admin can sign in", async ({ page }) => {
  test.skip(!clerkEmail || !clerkPassword, "Set E2E_CLERK_EMAIL and E2E_CLERK_PASSWORD.");

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Enter your email").fill(clerkEmail!);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByPlaceholder("Enter your password").fill(clerkPassword!);
  await page.getByRole("button", { name: /continue|sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
});
