"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, CreditCard, TrendingDown, TrendingUp, UserCheck } from "lucide-react";
import { callApi, queryKeys } from "@/lib/api";
import { POLL_INTERVALS } from "@/lib/query/make-query-client";
import { fixtureOverviewMetrics, resolveData } from "@/lib/fixtures";
import { MetricCard } from "@/components/general/MetricCard";
import {
  formatCents,
  formatNumber,
  formatPct,
  formatSignedPct,
  lastMonthLabel,
} from "@/lib/format";

export const overviewMetricsQuery = {
  queryKey: queryKeys.overview.metrics(),
  queryFn: () =>
    resolveData({ metrics: fixtureOverviewMetrics }, () => callApi("GET_OVERVIEW_METRICS")),
  refetchInterval: POLL_INTERVALS.dashboard,
};

/** 5-card metrics row — MRR, ARR, Premium Users, Churn Rate, DAU/MAU. */
export function OverviewMetricCards() {
  const { data } = useSuspenseQuery(overviewMetricsQuery);
  const m = data.metrics;
  // Figma's "of X total · Y%" reads as DAU ÷ total registered users, not
  // DAU ÷ MAU (the contract's `ratioPct`) — derived here rather than adding
  // a second near-duplicate percentage field to the API response.
  const dauOfTotalPct = m.dauMau.totalUsers > 0 ? (m.dauMau.dau / m.dauMau.totalUsers) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        label="MRR"
        value={formatCents(m.mrr.cents)}
        icon={CreditCard}
        hint={`${formatSignedPct(m.mrr.deltaPct)} vs ${lastMonthLabel()}`}
      />
      <MetricCard
        label="ARR"
        value={formatCents(m.arr.cents)}
        icon={TrendingUp}
        hint={`${formatSignedPct(m.arr.deltaPct)} vs last year`}
      />
      <MetricCard
        label="Premium Users"
        value={formatNumber(m.premiumUsers.total)}
        icon={UserCheck}
        hint={`${formatNumber(m.premiumUsers.monthly)} monthly · ${formatNumber(m.premiumUsers.annual)} annual`}
      />
      <MetricCard
        label="Churn Rate"
        value={formatPct(m.churnRate.pct)}
        icon={TrendingDown}
        tone="destructive"
        hint={`Churned MRR: ${formatCents(m.churnRate.churnedMrrCents)}`}
      />
      <MetricCard
        label="DAU / MAU"
        value={formatNumber(m.dauMau.dau)}
        icon={Activity}
        hint={`of ${formatNumber(m.dauMau.totalUsers)} total · ${formatPct(dauOfTotalPct, 0)}`}
      />
    </div>
  );
}
