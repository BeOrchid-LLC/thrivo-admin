import { describe, it, expect } from "vitest";
import { createPageMetadata } from "../metadata";
import { DEFAULT_DESCRIPTION } from "../site";
import { PAGE_SEO } from "../pages";

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

describe("PAGE_SEO", () => {
  it.each(Object.entries(PAGE_SEO))("defines title and description for %s", (_key, seo) => {
    expect(seo.title.length).toBeGreaterThan(0);
    expect(seo.description.length).toBeGreaterThan(0);
  });
});
