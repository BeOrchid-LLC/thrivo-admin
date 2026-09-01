import { expect, test } from "@playwright/test";

/** These smoke checks verify the custom Thrivo UI against a real Clerk instance. */

const clerkPublishableKey = process.env.E2E_CLERK_PUBLISHABLE_KEY;

test.describe("Clerk authentication shell", () => {
  test.skip(
    !clerkPublishableKey,
    "Set E2E_CLERK_PUBLISHABLE_KEY to run Clerk UI smoke tests against a real instance."
  );

  test("login renders the Thrivo sign-in form", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("password recovery renders the custom request form", async ({ page }) => {
    await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
    await expect(page.getByPlaceholder("Enter your email")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: /send reset code/i })).toBeVisible();
  });

  test("reset and invitation routes render custom surfaces", async ({ page }) => {
    await page.goto("/reset-password", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/reset link expired|enter your reset code/i)).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/accept-invite", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/accept your invitation|invitation required/i)).toBeVisible({
      timeout: 20_000,
    });
  });

  test("account-management route remains protected", async ({ page }) => {
    await page.goto("/profile/account", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });
  });
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
  await page.getByPlaceholder("Enter your password").fill(clerkPassword!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
});
