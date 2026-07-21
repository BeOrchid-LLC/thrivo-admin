"use client";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import type { ListParams } from "@/lib/api";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SubscriptionsTable } from "./SubscriptionsTable";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "canceled", label: "Canceled" },
  { value: "expired", label: "Expired" },
  { value: "none", label: "No subscription" },
];

export function SubscriptionsSection() {
  const { filters, isPending, searchInput, setSearchInput, setStatus, setPage } =
    useUrlListFilters();
  const params: ListParams = {
    page: filters.page,
    pageSize: DEFAULT_PAGE_SIZE,
    status: filters.status,
    q: filters.q || undefined,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Status, tier and upgrade-trigger breakdown." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={filters.status} onValueChange={setStatus} className="flex-1">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          className="w-full sm:w-64"
          placeholder="Search email or Stripe ID…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={`${params.page}-${params.status}-${params.q}`}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load subscriptions."
        >
          <SubscriptionsTable params={params} onPageChange={setPage} />
        </QueryBoundary>
      </div>
    </div>
  );
}
