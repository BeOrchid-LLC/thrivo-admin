import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ThrivoLogo from "@/components/icons/ThrivoLogo";

describe("ThrivoLogo", () => {
  it("renders the brand SVG with the expected viewBox", () => {
    const { container } = render(<ThrivoLogo data-testid="thrivo-logo" />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 80 80");
    expect(svg?.querySelectorAll("path")).toHaveLength(3);
  });
});
