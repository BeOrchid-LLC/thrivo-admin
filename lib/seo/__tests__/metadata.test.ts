import { describe, it, expect } from "vitest";
import { createPageMetadata } from "../metadata";
import { DEFAULT_DESCRIPTION } from "../site";

describe("createPageMetadata", () => {
  it("sets title and description from input", () => {
    const metadata = createPageMetadata({
      title: "Users",
      description: "Search and manage Thrivo user accounts",
    });

    expect(metadata.title).toBe("Users");
    expect(metadata.description).toBe("Search and manage Thrivo user accounts");
  });

  it("falls back to the site default description when omitted", () => {
    const metadata = createPageMetadata({ title: "Dashboard" });

    expect(metadata.title).toBe("Dashboard");
    expect(metadata.description).toBe(DEFAULT_DESCRIPTION);
  });
});
