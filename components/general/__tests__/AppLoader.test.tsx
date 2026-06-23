import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppLoader } from "@/components/general/AppLoader";

describe("AppLoader", () => {
  it("renders the logo and spinner", () => {
    const { container } = render(<AppLoader />);

    expect(container.querySelector("svg")).toHaveAttribute("viewBox", "0 0 80 80");
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders an optional message", () => {
    render(<AppLoader message="Loading session…" />);

    expect(screen.getByText("Loading session…")).toBeInTheDocument();
  });
});
