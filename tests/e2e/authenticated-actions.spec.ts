import { expect, test } from "@playwright/test";

/**
 * Authenticated operational smoke coverage. Generate a Clerk storage state
 * with a non-production test admin and provide its path through
 * E2E_CLERK_STORAGE_STATE. The default local Playwright server runs fixture
 * mode, so this suite exercises the real protected UI without requiring a
 * live backend or mutating production data.
 */
const storageState = process.env.E2E_CLERK_STORAGE_STATE;

test.describe("authenticated operational actions", () => {
  test.skip(!storageState, "Set E2E_CLERK_STORAGE_STATE to run authenticated UI smoke tests.");
  test.use({ storageState });

  test("signed-in admin can reach operational surfaces and action controls", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({ timeout: 30_000 });

    await page.goto("/leads", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /actions for/i }).first()).toBeVisible();

    await page.goto("/push", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Push campaigns" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: /new campaign/i })).toBeVisible();

    await page.goto("/audit", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /audit/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: /export csv/i })).toBeVisible();
  });
});
