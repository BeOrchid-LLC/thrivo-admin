import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExternalLink } from "lucide-react";
import { getViewAction } from "../getViewAction";

describe("getViewAction", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { location: { href: "" } });
  });

  it("returns label 'View full details'", () => {
    const action = getViewAction("/users/123");
    expect(action.label).toBe("View full details");
  });

  it("returns ExternalLink icon", () => {
    const action = getViewAction("/users/123");
    expect(action.icon).toBe(ExternalLink);
  });

  it("onClick navigates to the given href", () => {
    const action = getViewAction("/foods/abc");
    action.onClick?.();
    expect(window.location.href).toBe("/foods/abc");
  });

  it("accepts any href path", () => {
    const action = getViewAction("/push/xyz");
    action.onClick?.();
    expect(window.location.href).toBe("/push/xyz");
  });
});
