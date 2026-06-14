import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCard } from "@/components/general/MetricCard";

describe("Phase 8 — MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="MRR" value="$4,320.00" />);
    expect(screen.getByText("MRR")).toBeInTheDocument();
    expect(screen.getByText("$4,320.00")).toBeInTheDocument();
  });

  it("hides the value while loading", () => {
    render(<MetricCard label="MRR" value="$4,320.00" loading />);
    expect(screen.queryByText("$4,320.00")).not.toBeInTheDocument();
  });
});
