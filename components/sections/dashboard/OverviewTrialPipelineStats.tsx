"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { callApi, queryKeys } from "@/lib/api";
import { POLL_INTERVALS } from "@/lib/query/make-query-client";
import { fixtureOverviewTrialPipeline, resolveData } from "@/lib/fixtures";
import { formatNumber, formatPct } from "@/lib/format";
import { SegmentedBar } from "@/components/charts/SegmentedBar";
import { cn } from "@/lib/utils";

export const overviewTrialPipelineQuery = {
  queryKey: queryKeys.overview.trialPipeline(),
  queryFn: () =>
    resolveData({ trialPipeline: fixtureOverviewTrialPipeline }, () =>
      callApi("GET_OVERVIEW_TRIAL_PIPELINE")
    ),
  refetchInterval: POLL_INTERVALS.dashboard,
};

function Stat({
  value,
  label,
  pct,
  tone,
}: {
  value: number;
  label: string;
  pct?: number;
  tone?: "success" | "destructive";
}) {
  return (
    <div className="text-center">
      <p
        className={cn(
          "text-3xl font-bold text-foreground",
          tone === "success" && "text-primary",
          tone === "destructive" && "text-destructive"
        )}
      >
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {pct !== undefined ? (
        <p
          className={cn(
            "text-xs font-medium",
            tone === "success" && "text-primary",
            tone === "destructive" && "text-destructive"
          )}
        >
          {formatPct(pct, 0)}
        </p>
      ) : null}
    </div>
  );
}

/** Started/Converted/Cancelled stat blocks + segmented progress bar + legend. */
export function OverviewTrialPipelineStats() {
  const { data } = useSuspenseQuery(overviewTrialPipelineQuery);
  const p = data.trialPipeline;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat value={p.started} label="Started" />
        <Stat value={p.converted} label="Converted" pct={p.convertedPct} tone="success" />
        <Stat value={p.cancelled} label="Cancelled" pct={p.cancelledPct} tone="destructive" />
      </div>

      <SegmentedBar
        segments={[
          { label: "Converted", pct: p.convertedPct, colorClassName: "bg-primary" },
          { label: "Cancelled", pct: p.cancelledPct, colorClassName: "bg-destructive" },
          { label: "Active trials", pct: p.activePct, colorClassName: "bg-accent" },
        ]}
      />
    </div>
  );
}
