import { describe, it, expect } from "vitest";
import { ENDPOINTS } from "../endpoints";
import { apiErrorFromResponse } from "../errors";
import { sessionResponse, successEnvelope } from "@/lib/contracts";
import { fixtureUserDetail, fixtureUsersPage, fixtureLeadsPage } from "@/lib/fixtures";

describe("Phase 2 — admin endpoints contract", () => {
  it("every endpoint declares a valid path, method and response schema", () => {
    const methods = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);
    for (const [key, config] of Object.entries(ENDPOINTS)) {
      expect(config.path === "/users/me" || config.path.startsWith("/admin/")).toBe(true);
      expect(methods.has(config.method)).toBe(true);
      expect(typeof config.response.safeParse).toBe("function");
      if (config.method === "GET" || config.method === "DELETE") {
        expect("payload" in config).toBe(false);
        expect(key).toBeTruthy();
      }
    }
  });

  it("round-trips a valid success envelope through a response schema", () => {
    const envelope = successEnvelope(sessionResponse);
    const parsed = envelope.safeParse({
      success: true,
      responseCode: 200,
      message: "OK",
      data: { admin: { id: "a1", email: "ops@beorchid.com", name: "Ops", role: "admin" } },
    });
    expect(parsed.success).toBe(true);
  });

  it("parses GET /users/me through the published contract package", () => {
    const envelope = successEnvelope(ENDPOINTS.GET_ME.response);
    const parsed = envelope.safeParse({
      success: true,
      responseCode: 200,
      message: "OK",
      data: {
        id: "68711c81-d52c-4798-9fb0-ccda25f27a24",
        email: "user@thrivo.app",
        name: "Ada",
        image: null,
        goal: "lose",
        sex: "female",
        age: 34,
        heightCm: "170.0",
        weightKg: "82.5",
        targetWeightKg: "74.0",
        tdeeKcal: 2200,
        dailyTargetKcal: 1800,
        targetProteinG: 130,
        targetCarbsG: 180,
        targetFatG: 60,
        activityLevel: "moderate",
        manualDailyTargetKcal: null,
        notifyTimes: null,
        timezone: "Africa/Lagos",
        tier: "free",
        accountStatus: "free_plan",
        trialEndsAt: null,
        onboardingStep: 3,
        isOnboarded: true,
        isOnboardingSkipped: false,
        createdAt: "2026-06-18T00:00:00.000Z",
      },
    });
    expect(parsed.success).toBe(true);
  });

  it("parses the keyset-paginated admin user list (R5-4) — {limit,total,nextCursor}, not page/pageSize", () => {
    const result = ENDPOINTS.LIST_USERS.response.safeParse(fixtureUsersPage);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pagination).toEqual(
        expect.objectContaining({ limit: expect.any(Number), nextCursor: null })
      );
      expect(result.data.pagination).not.toHaveProperty("page");
      expect(result.data.pagination).not.toHaveProperty("totalPages");
    }
    expect(ENDPOINTS.GET_USER.response.safeParse({ user: fixtureUserDetail }).success).toBe(true);
  });

  it("parses the keyset-paginated admin leads list (R5-4) — {limit,total,nextCursor}, not page/pageSize", () => {
    const result = ENDPOINTS.LIST_LEADS.response.safeParse(fixtureLeadsPage);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pagination).toEqual(
        expect.objectContaining({ limit: expect.any(Number), nextCursor: null })
      );
      expect(result.data.pagination).not.toHaveProperty("page");
      expect(result.data.pagination).not.toHaveProperty("totalPages");
    }
  });

  it("maps a backend error envelope to a typed ApiError", () => {
    const err = apiErrorFromResponse(403, {
      error: { code: "FORBIDDEN", message: "Admins only" },
    });
    expect(err.code).toBe("FORBIDDEN");
    expect(err.status).toBe(403);
  });
});
