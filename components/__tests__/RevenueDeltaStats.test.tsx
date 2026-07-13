import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevenueDeltaStats } from "@/components/sections/dashboard/RevenueDeltaStats";

describe("RevenueDeltaStats", () => {
  it("signs New/Net-New MRR positive and Churned MRR negative regardless of input sign", () => {
    render(
      <RevenueDeltaStats
        month="Jun"
        newMrrCents={34400}
        churnedMrrCents={9100}
        netNewMrrCents={25300}
      />
    );

    expect(screen.getByText("New MRR (Jun)")).toBeInTheDocument();
    expect(screen.getByText("+$344.00")).toBeInTheDocument();
    expect(screen.getByText("Churned MRR (Jun)")).toBeInTheDocument();
    expect(screen.getByText("−$91.00")).toBeInTheDocument();
    expect(screen.getByText("Net New MRR")).toBeInTheDocument();
    expect(screen.getByText("+$253.00")).toBeInTheDocument();
  });

  it("still shows Churned MRR as negative even if the input is already negative", () => {
    render(
      <RevenueDeltaStats month="Jun" newMrrCents={0} churnedMrrCents={-9100} netNewMrrCents={0} />
    );
    expect(screen.getByText("−$91.00")).toBeInTheDocument();
  });
});
