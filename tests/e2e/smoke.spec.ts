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

  test("protected dashboard is not publicly accessible", async ({ request }) => {
    const response = await request.get("/dashboard", { maxRedirects: 0 });
    // Clerk's development browser protection rewrites to a private 404 when
    // no browser session is present; deployed Clerk instances redirect to a
    // sign-in surface instead. Either result is correct for this boundary
    // smoke test as long as the protected page never returns 200.
    expect(response.status()).not.toBe(200);
    if ([302, 307, 308].includes(response.status())) {
      expect(response.headers().location).toMatch(/sign-in|login/i);
    }
  });
});
