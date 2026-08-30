"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/TrendChart";
import { callApi, queryKeys } from "@/lib/api";
import { POLL_INTERVALS } from "@/lib/query/make-query-client";
import { fixtureOverviewRevenueTrend, resolveData } from "@/lib/fixtures";
import { formatCompactCents, lastMonthLabel } from "@/lib/format";
import { RevenueDeltaStats } from "./RevenueDeltaStats";

type OverviewRange = { from?: string; to?: string };

export function overviewRevenueTrendQuery(range: OverviewRange) {
  return {
    queryKey: queryKeys.overview.revenueTrend(range),
    queryFn: () =>
      resolveData({ revenueTrend: fixtureOverviewRevenueTrend }, () =>
        callApi("GET_OVERVIEW_REVENUE_TREND", { query: range })
      ),
    refetchInterval: POLL_INTERVALS.dashboard,
  };
}

const monthAbbrev = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });

/** Revenue trend card — 6-month MRR area chart + New/Churned/Net-New MRR row. */
export function OverviewRevenueTrend({ range }: { range: OverviewRange }) {
  const { data } = useSuspenseQuery(overviewRevenueTrendQuery(range));
  const { trend, newMrrCents, churnedMrrCents, netNewMrrCents } = data.revenueTrend;
  const chartData = trend.map((point) => ({ ...point, date: monthAbbrev(point.date) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly recurring revenue — {range.from || range.to ? "selected period" : "last 6 months"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <TrendChart data={chartData} formatValue={formatCompactCents} />
        <RevenueDeltaStats
          month={range.from || range.to ? "selected period" : lastMonthLabel()}
          newMrrCents={newMrrCents}
          churnedMrrCents={churnedMrrCents}
          netNewMrrCents={netNewMrrCents}
        />
      </CardContent>
    </Card>
  );
}
