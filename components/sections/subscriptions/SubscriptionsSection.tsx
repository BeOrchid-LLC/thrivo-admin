"use client";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import type { ListParams } from "@/lib/api";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { filters, isPending, setStatus, setPage } = useUrlListFilters();
  const params: ListParams = {
    page: filters.page,
    pageSize: DEFAULT_PAGE_SIZE,
    status: filters.status,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="Status, tier and upgrade-trigger breakdown." />

      <Tabs value={filters.status} onValueChange={setStatus}>
        <TabsList className="flex h-auto flex-wrap justify-start gap-1">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={`${params.page}-${params.status}`}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load subscriptions."
        >
          <SubscriptionsTable params={params} onPageChange={setPage} />
        </QueryBoundary>
      </div>
    </div>
  );
}
