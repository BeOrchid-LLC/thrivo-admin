"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { type ListParams } from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import { useCursorPagination } from "@/lib/hooks/useCursorPagination";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FoodsTable } from "./FoodsTable";
import { FoodDetailDrawer } from "./FoodDetailDrawer";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
  { value: "merged", label: "Merged" },
] as const;

export function FoodsSection() {
  const { filters, isPending, searchInput, setSearchInput, setStatus } = useUrlListFilters();
  const pagination = useCursorPagination();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // A filter change invalidates every cursor collected under the old query.
  useEffect(() => {
    pagination.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.status]);

  const params: ListParams & { tier?: string } = {
    cursor: pagination.cursor,
    limit: DEFAULT_PAGE_SIZE,
    search: filters.q,
    status: filters.status !== "all" ? filters.status : undefined,
  };

  const boundaryKey = `${pagination.pageNumber}-${filters.status}-${params.search}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Food catalog"
        description="Moderate and curate community catalog items. Personal items are private and never shown."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab.value}
              size="sm"
              variant={filters.status === tab.value ? "default" : "outline"}
              onClick={() => setStatus(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="relative lg:max-w-xs lg:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={boundaryKey}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load catalog items."
        >
          <FoodsTable
            params={params}
            onRowClick={(food) => setSelectedId(food.id)}
            pageNumber={pagination.pageNumber}
            hasPrev={pagination.hasPrev}
            onNext={pagination.goNext}
            onPrev={pagination.goPrev}
          />
        </QueryBoundary>
      </div>

      <FoodDetailDrawer foodId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
