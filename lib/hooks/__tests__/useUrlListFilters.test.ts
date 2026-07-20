import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUrlListFilters } from "../useUrlListFilters";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

const mockNav = (qs = "") => {
  vi.mocked(usePathname).mockReturnValue("/test");
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams(qs) as ReturnType<typeof useSearchParams>
  );
};

describe("useUrlListFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", {
      history: { replaceState: vi.fn() },
    });
  });

  it("returns defaults when URL has no params", () => {
    mockNav();
    const { result } = renderHook(() => useUrlListFilters());
    expect(result.current.filters.status).toBe("all");
    expect(result.current.filters.q).toBe("");
    expect(result.current.filters.page).toBe(1);
  });

  it("reads status from URL", () => {
    mockNav("status=active");
    const { result } = renderHook(() => useUrlListFilters());
    expect(result.current.filters.status).toBe("active");
  });

  it("reads q from URL", () => {
    mockNav("q=foo%40bar.com");
    const { result } = renderHook(() => useUrlListFilters());
    expect(result.current.filters.q).toBe("foo@bar.com");
  });

  it("reads page from URL, floors at 1", () => {
    mockNav("page=3");
    const { result } = renderHook(() => useUrlListFilters());
    expect(result.current.filters.page).toBe(3);
  });

  it("page 0 in URL clamps to 1", () => {
    mockNav("page=0");
    const { result } = renderHook(() => useUrlListFilters());
    expect(result.current.filters.page).toBe(1);
  });

  it("setSearchInput reflects in searchInput", () => {
    mockNav();
    const { result } = renderHook(() => useUrlListFilters());
    act(() => result.current.setSearchInput("hello"));
    expect(result.current.searchInput).toBe("hello");
  });

  it("clearFilters resets searchInput and replaces URL", () => {
    mockNav("q=test&status=active");
    const { result } = renderHook(() => useUrlListFilters());
    act(() => result.current.clearFilters());
    expect(result.current.searchInput).toBe("");
    expect(window.history.replaceState).toHaveBeenCalled();
  });
});
