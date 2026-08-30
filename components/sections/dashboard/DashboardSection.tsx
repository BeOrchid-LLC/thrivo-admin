"use client";

import { PageHeader } from "@/components/general/PageHeader";
import { Input } from "@/components/ui/input";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { MetricCardsFallback } from "@/components/general/skeletons/MetricCardsFallback";
import { ChartCardFallback } from "@/components/general/skeletons/ChartCardFallback";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { APP_VERSION } from "@/lib/constants";
import { OverviewMetricCards } from "./OverviewMetricCards";
import { OverviewRevenueTrend } from "./OverviewRevenueTrend";
import { OverviewTrialPipelineCard } from "./OverviewTrialPipelineCard";
import { OverviewRecentUsersTable } from "./OverviewRecentUsersTable";
import { DashboardExportButton } from "./DashboardExportButton";

/** Today's date + app version — static/trivially-derived, so it renders
 *  immediately and never waits behind any of the data sections below. */
function overviewDescription(): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${today} · THRIVO ${APP_VERSION}`;
}

export function DashboardSection() {
  const { filters, setFrom, setTo } = useUrlListFilters();
  const range = {
    from: filters.from || undefined,
    to: filters.to || undefined,
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={overviewDescription()}
        actions={<DashboardExportButton range={range} />}
      />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="overview-from">
            From
          </label>
          <Input
            id="overview-from"
            type="date"
            value={filters.from.slice(0, 10)}
            onChange={(event) =>
              setFrom(event.target.value ? `${event.target.value}T00:00:00.000Z` : "")
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="overview-to">
            Through
          </label>
          <Input
            id="overview-to"
            type="date"
            value={filters.to.slice(0, 10)}
            onChange={(event) =>
              setTo(event.target.value ? `${event.target.value}T23:59:59.999Z` : "")
            }
          />
        </div>
        <p className="pb-2 text-xs text-muted-foreground">
          The selected window applies to revenue trend and trial pipeline. Snapshot metric cards
          remain current.
        </p>
      </div>

      <QueryBoundary fallback={<MetricCardsFallback count={5} />}>
        <OverviewMetricCards />
      </QueryBoundary>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <QueryBoundary
          fallback={<ChartCardFallback />}
          errorMessage="Could not load revenue trend."
        >
          <OverviewRevenueTrend range={range} />
        </QueryBoundary>

        {/* OverviewTrialPipelineCard owns its own two QueryBoundaries
            internally (trial-pipeline stats + plan-breakdown are separate
            endpoints sharing one visual card). */}
        <OverviewTrialPipelineCard range={range} />
      </div>

      <QueryBoundary
        fallback={<TableContentSkeleton />}
        errorMessage="Could not load recent users."
      >
        <OverviewRecentUsersTable />
      </QueryBoundary>
    </div>
  );
}
