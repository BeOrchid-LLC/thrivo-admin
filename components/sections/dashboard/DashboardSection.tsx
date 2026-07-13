import { Download } from "lucide-react";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { MetricCardsFallback } from "@/components/general/skeletons/MetricCardsFallback";
import { ChartCardFallback } from "@/components/general/skeletons/ChartCardFallback";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { APP_VERSION } from "@/lib/constants";
import { OverviewMetricCards } from "./OverviewMetricCards";
import { OverviewRevenueTrend } from "./OverviewRevenueTrend";
import { OverviewTrialPipelineCard } from "./OverviewTrialPipelineCard";
import { OverviewRecentUsersTable } from "./OverviewRecentUsersTable";

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
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={overviewDescription()}
        actions={
          <Tooltip>
            <TooltipTrigger asChild>
              {/* Export target is unspecified in the design (unlike Recent
                  Users' explicit "Export CSV") — stubbed disabled pending
                  product/design clarification on what it should export. */}
              <span>
                <Button variant="default" size="sm" disabled>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Coming soon</TooltipContent>
          </Tooltip>
        }
      />

      <QueryBoundary fallback={<MetricCardsFallback count={5} />}>
        <OverviewMetricCards />
      </QueryBoundary>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <QueryBoundary
          fallback={<ChartCardFallback />}
          errorMessage="Could not load revenue trend."
        >
          <OverviewRevenueTrend />
        </QueryBoundary>

        {/* OverviewTrialPipelineCard owns its own two QueryBoundaries
            internally (trial-pipeline stats + plan-breakdown are separate
            endpoints sharing one visual card). */}
        <OverviewTrialPipelineCard />
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
