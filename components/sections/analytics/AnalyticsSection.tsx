"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { callApi, queryKeys } from "@/lib/api";
import {
  fixtureEngagementAnalytics,
  fixtureSubscriptionAnalytics,
  resolveData,
} from "@/lib/fixtures";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { PageHeader } from "@/components/general/PageHeader";
import { MetricCardsFallback } from "@/components/general/skeletons/MetricCardsFallback";
import { ChartCardFallback } from "@/components/general/skeletons/ChartCardFallback";
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

function SubscriptionAnalyticsBlock() {
  const { data } = useSuspenseQuery(subscriptionAnalyticsQuery);
  const s = data.analytics;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard label="Trial starts" value={formatNumber(s.trialStarts)} />
        <MetricCard label="Trial conversions" value={formatNumber(s.trialConversions)} />
        <MetricCard label="Cancellations" value={formatNumber(s.cancellations)} tone="accent" />
        <MetricCard
          label="Free / Premium"
          value={`${formatNumber(s.freeCount)} / ${formatNumber(s.premiumCount)}`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="MRR trend">
          <TrendChart data={s.mrrTrend} formatValue={formatCents} />
        </ChartCard>
        <ChartCard title="Churn trend">
          <TrendChart data={s.churnTrend} formatValue={(v) => formatPercent(v)} />
        </ChartCard>
        <ChartCard title="Upgrade triggers">
          <CategoryBar
            data={s.upgradeTriggers.map((t) => ({ label: t.trigger, value: t.count }))}
            formatValue={formatNumber}
          />
        </ChartCard>
      </div>
    </>
  );
}

function EngagementAnalyticsBlock() {
  const { data } = useSuspenseQuery(engagementAnalyticsQuery);
  const e = data.analytics;

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Onboarding funnel">
        <CategoryBar
          data={e.onboardingFunnel.map((f) => ({ label: f.step, value: f.count }))}
          formatValue={formatNumber}
        />
      </ChartCard>
      <ChartCard title="Top foods logged">
        <CategoryBar
          data={e.topFoods.map((f) => ({ label: f.name, value: f.count }))}
          formatValue={formatNumber}
        />
      </ChartCard>
      <ChartCard title="Retention cohorts">
        <CohortGrid data={e.retention} />
      </ChartCard>
    </div>
  );
}

export function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Revenue, conversion and engagement." />

      <QueryBoundary
        fallback={<MetricCardsFallback count={4} />}
        errorMessage="Could not load subscription analytics."
      >
        <SubscriptionAnalyticsBlock />
      </QueryBoundary>

      <QueryBoundary
        fallback={
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCardFallback />
            <ChartCardFallback />
          </div>
        }
        errorMessage="Could not load engagement analytics."
      >
        <EngagementAnalyticsBlock />
      </QueryBoundary>
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
