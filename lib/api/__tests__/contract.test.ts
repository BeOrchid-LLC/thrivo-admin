import { describe, it, expect } from "vitest";
import { ENDPOINTS } from "../endpoints";
import { apiErrorFromResponse } from "../errors";
import { sessionResponse, successEnvelope } from "@/lib/contracts";

describe("Phase 2 — admin endpoints contract", () => {
  it("every endpoint declares a valid path, method and response schema", () => {
    const methods = new Set(["GET", "POST", "PATCH", "PUT", "DELETE"]);
    for (const [key, config] of Object.entries(ENDPOINTS)) {
      expect(config.path.startsWith("/admin/")).toBe(true);
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
      data: { admin: { id: "a1", email: "ops@beorchid.com", name: "Ops", role: "admin" } },
    });
    expect(parsed.success).toBe(true);
  });

  it("maps a backend error envelope to a typed ApiError", () => {
    const err = apiErrorFromResponse(403, {
      error: { code: "FORBIDDEN", message: "Admins only" },
    });
    expect(err.code).toBe("FORBIDDEN");
    expect(err.status).toBe(403);
  });
});
