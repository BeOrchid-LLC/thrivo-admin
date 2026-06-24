"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useDebounce } from "./useDebounce";

export interface UrlListFilters {
  status: string;
  q: string;
  page: number;
}

/** URL-synced list filters (`status`, `q`, `page`) via `history.replaceState`. */
export function useUrlListFilters(debounceMs = 300) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo<UrlListFilters>(
    () => ({
      status: searchParams.get("status") || "all",
      q: searchParams.get("q") || "",
      page: Math.max(1, Number(searchParams.get("page") || "1") || 1),
    }),
    [searchParams]
  );

  const replaceParams = useCallback(
    (updates: Partial<Record<"status" | "q" | "page", string | null>>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParamsString);
        for (const [key, rawValue] of Object.entries(updates)) {
          const value = rawValue?.trim() ?? "";
          if (
            !value ||
            (key === "status" && value === "all") ||
            (key === "page" && (value === "1" || value === ""))
          ) {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        }
        const qs = params.toString();
        window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, searchParamsString]
  );

  const [searchInput, setSearchInput] = useState(filters.q);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  const debouncedSearch = useDebounce(searchInput, debounceMs);

  useEffect(() => {
    const nextQ = debouncedSearch.trim();
    if (nextQ === filters.q) return;
    replaceParams({ q: nextQ || null, page: null });
  }, [debouncedSearch, filters.q, replaceParams]);

  return {
    filters,
    isPending,
    searchInput,
    setSearchInput,
    setStatus: (status: string) =>
      replaceParams({ status: status === "all" ? null : status, page: null }),
    setPage: (page: number) => replaceParams({ page: page <= 1 ? null : String(page) }),
    clearFilters: () => {
      setSearchInput("");
      startTransition(() => window.history.replaceState(null, "", pathname));
    },
  };
}
