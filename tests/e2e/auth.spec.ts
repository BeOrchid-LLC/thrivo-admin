import { expect, test } from "@playwright/test";

/**
 * Auth E2E flows — password login, forgot-password, accept-invite, disabled account.
 *
 * All API calls are mocked via context.route() so the tests run against the Next.js
 * dev/fixture server only, without needing a live backend.
 */

test.describe("Password login", () => {
  test("successful login redirects to dashboard", async ({ page, context }) => {
    await context.route(/\/api\/v1\/admin\/auth\/session/, (r) =>
      r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "No session" } }) })
    );
    await context.route(/\/api\/v1\/admin\/auth\/login/, (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { ok: true } }) })
    );
    // After login, session returns the admin
    let loginDone = false;
    await context.route(/\/api\/v1\/admin\/auth\/session/, (r) => {
      if (loginDone) {
        return r.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { id: "a1", email: "ops@thrivo.fit", name: "Ops", role: "admin", status: "active" } }),
        });
      }
      return r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "No session" } }) });
    });

    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 20_000 });
    await page.getByLabel(/email/i).fill("ops@thrivo.fit");
    await page.getByLabel(/password/i).fill("TestPassword@2026");
    loginDone = true;
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("wrong credentials shows an error", async ({ page, context }) => {
    await context.route(/\/api\/v1\/admin\/auth\/session/, (r) =>
      r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "No session" } }) })
    );
    await context.route(/\/api\/v1\/admin\/auth\/login/, (r) =>
      r.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Invalid credentials" } }),
      })
    );
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 20_000 });
    await page.getByLabel(/email/i).fill("ops@thrivo.fit");
    await page.getByLabel(/password/i).fill("wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Forgot password flow", () => {
  test("submitting the form always routes to the sent page (anti-enumeration)", async ({ page, context }) => {
    await context.route(/\/api\/v1\/admin\/auth\/session/, (r) =>
      r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "No session" } }) })
    );
    await context.route(/\/api\/v1\/admin\/auth\/request-password-reset/, (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { ok: true } }) })
    );
    await page.goto("/forgot-password", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 20_000 });
    await page.getByLabel(/email/i).fill("nonexistent@example.com");
    await page.getByRole("button", { name: /send reset/i }).click();
    await expect(page).toHaveURL(/reset-password-sent/, { timeout: 10_000 });
  });
});

test.describe("Accept invite page", () => {
  test("shows non-dismissible invalid-link dialog when token is missing", async ({ page, context }) => {
    await context.route(/\/api\/v1\/admin\/auth\/session/, (r) =>
      r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "No session" } }) })
    );
    // Navigate with no email/token query params
    await page.goto("/accept-invite", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/invalid.*link|link.*invalid|expired|invalid invite/i)).toBeVisible({ timeout: 10_000 });
    // The dialog must not be dismissible — clicking outside should not close it
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("shows non-dismissible invalid-link dialog when reset token is missing", async ({ page, context }) => {
    await context.route(/\/api\/v1\/admin\/auth\/session/, (r) =>
      r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "No session" } }) })
    );
    await page.goto("/reset-password", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 20_000 });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test.describe("Disabled admin guard", () => {
  test("a disabled admin session is rejected and redirected to login", async ({ page, context }) => {
    // Session check returns 401 (disabled snapshot → backend refuses)
    await context.route(/\/api\/v1\/admin\/auth\/session/, (r) =>
      r.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "UNAUTHENTICATED", message: "Session expired" } }) })
    );
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
