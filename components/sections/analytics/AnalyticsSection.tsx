"use client";

import { useQuery } from "@tanstack/react-query";
import { callApi, queryKeys } from "@/lib/api";
import {
  fixtureEngagementAnalytics,
  fixtureSubscriptionAnalytics,
  resolveData,
} from "@/lib/fixtures";
import { PageHeader } from "@/components/general/PageHeader";
import { ErrorState } from "@/components/general/states";
import { MetricCard } from "@/components/general/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/TrendChart";
import { CategoryBar } from "@/components/charts/CategoryBar";
import { CohortGrid } from "@/components/charts/CohortGrid";
import { formatCents, formatNumber, formatPercent } from "@/lib/format";

export const subscriptionAnalyticsQuery = {
  queryKey: queryKeys.analytics.subscriptions(),
  queryFn: () =>
    resolveData({ analytics: fixtureSubscriptionAnalytics }, () =>
      callApi("GET_SUBSCRIPTION_ANALYTICS")
    ),
};

export const engagementAnalyticsQuery = {
  queryKey: queryKeys.analytics.engagement(),
  queryFn: () =>
    resolveData({ analytics: fixtureEngagementAnalytics }, () =>
      callApi("GET_ENGAGEMENT_ANALYTICS")
    ),
};

export function AnalyticsSection() {
  const subs = useQuery(subscriptionAnalyticsQuery);
  const eng = useQuery(engagementAnalyticsQuery);
  const s = subs.data?.analytics;
  const e = eng.data?.analytics;

  if (subs.isError || eng.isError) {
    return (
      <div>
        <PageHeader title="Analytics" description="Revenue, conversion and engagement." />
        <ErrorState
          onRetry={() => {
            void subs.refetch();
            void eng.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Analytics" description="Revenue, conversion and engagement." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Trial starts"
          value={s ? formatNumber(s.trialStarts) : "—"}
          loading={subs.isLoading}
        />
        <MetricCard
          label="Trial conversions"
          value={s ? formatNumber(s.trialConversions) : "—"}
          loading={subs.isLoading}
        />
        <MetricCard
          label="Cancellations"
          value={s ? formatNumber(s.cancellations) : "—"}
          tone="accent"
          loading={subs.isLoading}
        />
        <MetricCard
          label="Free / Premium"
          value={s ? `${formatNumber(s.freeCount)} / ${formatNumber(s.premiumCount)}` : "—"}
          loading={subs.isLoading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="MRR trend">
          <TrendChart data={s?.mrrTrend ?? []} formatValue={formatCents} />
        </ChartCard>
        <ChartCard title="Churn trend">
          <TrendChart data={s?.churnTrend ?? []} formatValue={(v) => formatPercent(v)} />
        </ChartCard>
        <ChartCard title="Upgrade triggers">
          <CategoryBar
            data={(s?.upgradeTriggers ?? []).map((t) => ({ label: t.trigger, value: t.count }))}
            formatValue={formatNumber}
          />
        </ChartCard>
        <ChartCard title="Onboarding funnel">
          <CategoryBar
            data={(e?.onboardingFunnel ?? []).map((f) => ({ label: f.step, value: f.count }))}
            formatValue={formatNumber}
          />
        </ChartCard>
        <ChartCard title="Top foods logged">
          <CategoryBar
            data={(e?.topFoods ?? []).map((f) => ({ label: f.name, value: f.count }))}
            formatValue={formatNumber}
          />
        </ChartCard>
        <ChartCard title="Retention cohorts">
          <CohortGrid data={e?.retention ?? []} />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
