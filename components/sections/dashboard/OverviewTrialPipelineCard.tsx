import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { OverviewTrialPipelineStats } from "./OverviewTrialPipelineStats";
import { OverviewPlanBreakdown } from "./OverviewPlanBreakdown";

function StatsFallback() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-16 w-20" />
        ))}
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

function PlanBreakdownFallback() {
  return (
    <div className="space-y-4" aria-hidden>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * "Trial pipeline" card. Header is static chrome; the stat-blocks/segmented-
 * bar and the plan-breakdown list below are two independently-fetched
 * sections (own QueryBoundary each) sharing one visual card.
 */
export function OverviewTrialPipelineCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trial pipeline</CardTitle>
        <p className="text-sm text-muted-foreground">Last 7 days</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <QueryBoundary fallback={<StatsFallback />} errorMessage="Could not load trial pipeline.">
          <OverviewTrialPipelineStats />
        </QueryBoundary>

        <Separator />

        <QueryBoundary
          fallback={<PlanBreakdownFallback />}
          errorMessage="Could not load plan breakdown."
        >
          <OverviewPlanBreakdown />
        </QueryBoundary>
      </CardContent>
    </Card>
  );
}
