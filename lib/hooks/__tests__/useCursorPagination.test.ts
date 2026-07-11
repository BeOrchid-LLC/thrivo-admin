import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCursorPagination } from "../useCursorPagination";

describe("useCursorPagination (R5-4)", () => {
  it("starts on page 1 with an undefined cursor and no prev", () => {
    const { result } = renderHook(() => useCursorPagination());
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.cursor).toBeUndefined();
    expect(result.current.hasPrev).toBe(false);
  });

  it("goNext advances the page and carries the given cursor", () => {
    const { result } = renderHook(() => useCursorPagination());

    act(() => result.current.goNext("cursor-a"));

    expect(result.current.pageNumber).toBe(2);
    expect(result.current.cursor).toBe("cursor-a");
    expect(result.current.hasPrev).toBe(true);
  });

  it("goNext with a null cursor (last page) is a no-op", () => {
    const { result } = renderHook(() => useCursorPagination());

    act(() => result.current.goNext(null));

    expect(result.current.pageNumber).toBe(1);
    expect(result.current.hasPrev).toBe(false);
  });

  it("goPrev replays the previously-seen cursor instead of refetching", () => {
    const { result } = renderHook(() => useCursorPagination());

    act(() => result.current.goNext("cursor-a"));
    act(() => result.current.goNext("cursor-b"));
    expect(result.current.pageNumber).toBe(3);
    expect(result.current.cursor).toBe("cursor-b");

    act(() => result.current.goPrev());
    expect(result.current.pageNumber).toBe(2);
    expect(result.current.cursor).toBe("cursor-a");

    act(() => result.current.goPrev());
    expect(result.current.pageNumber).toBe(1);
    expect(result.current.cursor).toBeUndefined();
  });

  it("goPrev at page 1 stays put (never goes negative)", () => {
    const { result } = renderHook(() => useCursorPagination());

    act(() => result.current.goPrev());

    expect(result.current.pageNumber).toBe(1);
    expect(result.current.hasPrev).toBe(false);
  });

  it("goNext after a goPrev discards the now-stale forward cursors (new filter/search mid-walk)", () => {
    const { result } = renderHook(() => useCursorPagination());

    act(() => result.current.goNext("cursor-a"));
    act(() => result.current.goNext("cursor-b"));
    act(() => result.current.goPrev()); // back to page 2, cursor-a
    act(() => result.current.goNext("cursor-c")); // a *different* forward cursor than cursor-b

    expect(result.current.pageNumber).toBe(3);
    expect(result.current.cursor).toBe("cursor-c");

    // The stale "cursor-b" branch must be gone — going back then forward
    // again should replay "cursor-c", not resurrect "cursor-b".
    act(() => result.current.goPrev());
    act(() => result.current.goNext("cursor-d"));
    expect(result.current.cursor).toBe("cursor-d");
  });

  it("reset returns to page 1 and clears the whole stack", () => {
    const { result } = renderHook(() => useCursorPagination());

    act(() => result.current.goNext("cursor-a"));
    act(() => result.current.goNext("cursor-b"));
    act(() => result.current.reset());

    expect(result.current.pageNumber).toBe(1);
    expect(result.current.cursor).toBeUndefined();
    expect(result.current.hasPrev).toBe(false);
  });
});
