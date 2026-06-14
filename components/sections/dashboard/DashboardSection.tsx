"use client";

import { useQuery } from "@tanstack/react-query";
import { CreditCard, Users, TrendingDown, Activity } from "lucide-react";
import { callApi, queryKeys } from "@/lib/api";
import { fixtureDashboardMetrics, resolveData } from "@/lib/fixtures";
import { PageHeader } from "@/components/general/PageHeader";
import { MetricCard } from "@/components/general/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/TrendChart";
import { ErrorState } from "@/components/general/states";
import { formatCents, formatNumber, formatPercent } from "@/lib/format";

// Client query options (the page does its own server-side prefetch on the same key).
export const dashboardQuery = {
  queryKey: queryKeys.metrics.dashboard(),
  queryFn: () =>
    resolveData({ metrics: fixtureDashboardMetrics }, () => callApi("GET_DASHBOARD_METRICS")),
};

export function DashboardSection() {
  const { data, isLoading, isError, refetch } = useQuery(dashboardQuery);
  const m = data?.metrics;

  return (
    <div>
      <PageHeader title="Dashboard" description="Revenue, growth and engagement at a glance." />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="MRR"
              value={m ? formatCents(m.mrrCents) : "—"}
              icon={CreditCard}
              loading={isLoading}
            />
            <MetricCard
              label="Active subscribers"
              value={m ? formatNumber(m.activeSubscribers) : "—"}
              icon={Users}
              loading={isLoading}
            />
            <MetricCard
              label="Churn rate"
              value={m ? formatPercent(m.churnRate) : "—"}
              icon={TrendingDown}
              tone="accent"
              loading={isLoading}
            />
            <MetricCard
              label="DAU / MAU"
              value={m ? `${formatNumber(m.dau)} / ${formatNumber(m.mau)}` : "—"}
              icon={Activity}
              loading={isLoading}
            />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Subscriber growth</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={m?.subscriberGrowth ?? []} formatValue={formatNumber} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
