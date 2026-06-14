import { describe, it, expect } from "vitest";
import { cn } from "../utils";
import { formatCents, formatNumber, formatPercent, formatDate } from "../format";

describe("Phase 8 — cn()", () => {
  it("merges and dedupes Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", false && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("Phase 8 — formatters", () => {
  it("formats money, numbers and percents", () => {
    expect(formatCents(432000)).toBe("$4,320.00");
    expect(formatNumber(1240)).toBe("1,240");
    expect(formatPercent(0.041)).toBe("4.1%");
  });

  it("formats and guards dates", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("2026-06-14T00:00:00.000Z")).toContain("2026");
  });
});
