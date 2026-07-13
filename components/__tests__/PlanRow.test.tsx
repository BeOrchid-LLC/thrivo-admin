import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlanRow } from "@/components/sections/dashboard/PlanRow";

describe("PlanRow", () => {
  it("renders the label and stats line", () => {
    render(
      <PlanRow label="Monthly ($14.99/mo)" statsLine="120 users · $1,798.80 MRR" pct={82.76} />
    );
    expect(screen.getByText("Monthly ($14.99/mo)")).toBeInTheDocument();
    expect(screen.getByText("120 users · $1,798.80 MRR")).toBeInTheDocument();
  });

  it("clamps the bar width to [0, 100]", () => {
    const { rerender } = render(<PlanRow label="A" statsLine="" pct={150} />);
    expect(screen.getByTestId("plan-row-fill")).toHaveStyle({ width: "100%" });

    rerender(<PlanRow label="A" statsLine="" pct={-10} />);
    expect(screen.getByTestId("plan-row-fill")).toHaveStyle({ width: "0%" });
  });
});
