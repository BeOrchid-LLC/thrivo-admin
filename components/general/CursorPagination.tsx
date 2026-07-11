"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CursorPaginationProps {
  pageNumber: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Prev/next pager for keyset-paginated lists (R5-4: users, leads). No total-
 * page count — a cursor walk doesn't know how many pages remain, only
 * whether there's a next one (`nextCursor !== null`).
 */
export function CursorPagination({
  pageNumber,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: CursorPaginationProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-1 pt-3">
      <p className="text-sm text-muted-foreground">Page {pageNumber}</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!hasPrev} onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button variant="outline" size="sm" disabled={!hasNext} onClick={onNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
