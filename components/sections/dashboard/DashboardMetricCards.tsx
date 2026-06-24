"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { CreditCard, Users, TrendingDown, Activity } from "lucide-react";
import { callApi, queryKeys } from "@/lib/api";
import { POLL_INTERVALS } from "@/lib/query/make-query-client";
import { fixtureDashboardMetrics, resolveData } from "@/lib/fixtures";
import { MetricCard } from "@/components/general/MetricCard";
import { formatCents, formatNumber, formatPercent } from "@/lib/format";

export const dashboardQuery = {
  queryKey: queryKeys.metrics.dashboard(),
  queryFn: () =>
    resolveData({ metrics: fixtureDashboardMetrics }, () => callApi("GET_DASHBOARD_METRICS")),
  refetchInterval: POLL_INTERVALS.dashboard,
};

/** KPI metric cards — fetches dashboard metrics via suspense query. */
export function DashboardMetricCards() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const m = data.metrics;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="MRR" value={formatCents(m.mrrCents)} icon={CreditCard} />
      <MetricCard
        label="Active subscribers"
        value={formatNumber(m.activeSubscribers)}
        icon={Users}
      />
      <MetricCard
        label="Churn rate"
        value={formatPercent(m.churnRate)}
        icon={TrendingDown}
        tone="accent"
      />
      <MetricCard
        label="DAU / MAU"
        value={`${formatNumber(m.dau)} / ${formatNumber(m.mau)}`}
        icon={Activity}
      />
    </div>
  );
}
