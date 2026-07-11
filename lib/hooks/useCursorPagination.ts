"use client";

import { useCallback, useState } from "react";

/**
 * Client-side cursor stack for keyset-paginated lists (R5-4: users, leads).
 * The backend only hands back a `nextCursor` — there's no server-side concept
 * of "page 5", so going backward means replaying cursors we've already seen
 * rather than asking the server for one. `cursors[0]` is always `undefined`
 * (the first page needs no cursor); each `goNext` push extends the stack by
 * one, and `goPrev` just moves the read pointer back — it never fetches.
 */
export function useCursorPagination() {
  const [cursors, setCursors] = useState<Array<string | undefined>>([undefined]);
  const [pageIndex, setPageIndex] = useState(0);

  const goNext = useCallback(
    (nextCursor: string | null) => {
      if (!nextCursor) return;
      setCursors((prev) => [...prev.slice(0, pageIndex + 1), nextCursor]);
      setPageIndex((i) => i + 1);
    },
    [pageIndex]
  );

  const goPrev = useCallback(() => {
    setPageIndex((i) => Math.max(0, i - 1));
  }, []);

  const reset = useCallback(() => {
    setCursors([undefined]);
    setPageIndex(0);
  }, []);

  return {
    cursor: cursors[pageIndex],
    pageNumber: pageIndex + 1,
    hasPrev: pageIndex > 0,
    goNext,
    goPrev,
    reset,
  };
}
