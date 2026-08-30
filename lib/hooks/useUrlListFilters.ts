"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useDebounce } from "./useDebounce";

export interface UrlListFilters {
  status: string;
  kind: string;
  q: string;
  page: number;
  owner: string;
  reconciled: string;
  from: string;
  to: string;
  targetId: string;
  requestId: string;
  template: string;
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
      kind: searchParams.get("kind") || "all",
      q: searchParams.get("q") || "",
      page: Math.max(1, Number(searchParams.get("page") || "1") || 1),
      owner: searchParams.get("owner") || "",
      reconciled: searchParams.get("reconciled") || "all",
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      targetId: searchParams.get("targetId") || "",
      requestId: searchParams.get("requestId") || "",
      template: searchParams.get("template") || "",
    }),
    [searchParams]
  );

  const replaceParams = useCallback(
    (
      updates: Partial<
        Record<
          | "status"
          | "kind"
          | "q"
          | "page"
          | "owner"
          | "reconciled"
          | "from"
          | "to"
          | "targetId"
          | "requestId"
          | "template",
          string | null
        >
      >
    ) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParamsString);
        for (const [key, rawValue] of Object.entries(updates)) {
          const value = rawValue?.trim() ?? "";
          if (
            !value ||
            ((key === "status" || key === "kind" || key === "reconciled") && value === "all") ||
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
    setKind: (kind: string) => replaceParams({ kind: kind === "all" ? null : kind, page: null }),
    setOwner: (owner: string) => replaceParams({ owner: owner || null, page: null }),
    setReconciled: (reconciled: string) =>
      replaceParams({ reconciled: reconciled === "all" ? null : reconciled, page: null }),
    setFrom: (from: string) => replaceParams({ from: from || null, page: null }),
    setTo: (to: string) => replaceParams({ to: to || null, page: null }),
    setTargetId: (targetId: string) => replaceParams({ targetId: targetId || null, page: null }),
    setRequestId: (requestId: string) =>
      replaceParams({ requestId: requestId || null, page: null }),
    setTemplate: (template: string) => replaceParams({ template: template || null, page: null }),
    setPage: (page: number) => replaceParams({ page: page <= 1 ? null : String(page) }),
    clearFilters: () => {
      setSearchInput("");
      startTransition(() => window.history.replaceState(null, "", pathname));
    },
  };
}
