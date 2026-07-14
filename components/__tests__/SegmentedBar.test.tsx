import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SegmentedBar } from "@/components/charts/SegmentedBar";

describe("SegmentedBar", () => {
  it("renders a legend entry with rounded percentage for every segment", () => {
    render(
      <SegmentedBar
        segments={[
          { label: "Converted", pct: 60.53, colorClassName: "bg-primary" },
          { label: "Cancelled", pct: 26.32, colorClassName: "bg-destructive" },
          { label: "Active trials", pct: 13.16, colorClassName: "bg-accent" },
        ]}
      />
    );

    expect(screen.getByText("Converted 61%")).toBeInTheDocument();
    expect(screen.getByText("Cancelled 26%")).toBeInTheDocument();
    expect(screen.getByText("Active trials 13%")).toBeInTheDocument();
  });

  it("clamps a negative percentage to 0 width instead of a negative CSS value", () => {
    render(<SegmentedBar segments={[{ label: "Odd", pct: -5, colorClassName: "bg-primary" }]} />);
    const bar = screen.getByTitle("Odd -5%");
    expect(bar).toHaveStyle({ width: "0%" });
  });
});
