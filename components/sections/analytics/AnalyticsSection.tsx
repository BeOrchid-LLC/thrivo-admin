"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { callApi, downloadApi, queryKeys } from "@/lib/api";
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
import { formatCents, formatNumber } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import type { EngagementAnalytics, SubscriptionAnalytics } from "@/lib/contracts";

type AnalyticsRange = {
  from?: string;
  to?: string;
  compareFrom?: string;
  compareTo?: string;
};

export function subscriptionAnalyticsQuery(range: AnalyticsRange) {
  const queryFn = () =>
    resolveData({ analytics: fixtureSubscriptionAnalytics }, () =>
      callApi("GET_SUBSCRIPTION_ANALYTICS", { query: range })
    );
  return { queryKey: queryKeys.analytics.subscriptions(range), queryFn };
}

export function engagementAnalyticsQuery(range: AnalyticsRange) {
  const queryFn = () =>
    resolveData({ analytics: fixtureEngagementAnalytics }, () =>
      callApi("GET_ENGAGEMENT_ANALYTICS", { query: range })
    );
  return { queryKey: queryKeys.analytics.engagement(range), queryFn };
}

function downloadAnalytics(
  endpoint: "EXPORT_SUBSCRIPTION_ANALYTICS" | "EXPORT_ENGAGEMENT_ANALYTICS",
  range: AnalyticsRange
) {
  void downloadApi(endpoint, { query: range }).then((blob) => {
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download =
      endpoint === "EXPORT_SUBSCRIPTION_ANALYTICS"
        ? "subscription-analytics.csv"
        : "engagement-analytics.csv";
    anchor.click();
    URL.revokeObjectURL(href);
  });
}

function SubscriptionAnalyticsBlock({ range }: { range: AnalyticsRange }) {
  const { data } = useSuspenseQuery(subscriptionAnalyticsQuery(range));
  const s = data.analytics as SubscriptionAnalytics;

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
      {s.comparison ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Previous period: {formatNumber(s.comparison.trialStarts)} trial starts,{" "}
          {formatNumber(s.comparison.trialConversions)} conversions,{" "}
          {formatNumber(s.comparison.cancellations)} cancellations,{" "}
          {formatCents(s.comparison.mrrCents)} MRR.
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="MRR trend">
          <TrendChart data={s.mrrTrend} formatValue={formatCents} />
        </ChartCard>
        <ChartCard title="Churn trend">
          <TrendChart data={s.churnTrend} formatValue={formatCents} />
        </ChartCard>
        <ChartCard title="Upgrade triggers">
          <CategoryBar
            data={s.upgradeTriggers.map((t) => ({ label: t.trigger, value: t.count }))}
            formatValue={formatNumber}
          />
        </ChartCard>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadAnalytics("EXPORT_SUBSCRIPTION_ANALYTICS", range)}
        >
          Export subscription data
        </Button>
      </div>
    </>
  );
}

function EngagementAnalyticsBlock({ range }: { range: AnalyticsRange }) {
  const { data } = useSuspenseQuery(engagementAnalyticsQuery(range));
  const e = data.analytics as EngagementAnalytics;

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
      {e.comparison ? (
        <p className="text-xs text-muted-foreground lg:col-span-2">
          Previous period: {formatNumber(e.comparison.signups)} signups,{" "}
          {formatNumber(e.comparison.completed)} completed onboarding,{" "}
          {formatNumber(e.comparison.skipped)} skipped, average streak{" "}
          {formatNumber(e.comparison.averageStreakDays)} days.
        </p>
      ) : null}
      <div className="flex justify-end lg:col-span-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadAnalytics("EXPORT_ENGAGEMENT_ANALYTICS", range)}
        >
          Export engagement data
        </Button>
      </div>
    </div>
  );
}

export function AnalyticsSection() {
  const { filters, setFrom, setTo } = useUrlListFilters();
  const [compare, setCompare] = useState(false);
  const range: AnalyticsRange = {
    from: filters.from || undefined,
    to: filters.to || undefined,
  };
  if (compare && filters.from && filters.to) {
    const from = new Date(filters.from).getTime();
    const to = new Date(filters.to).getTime();
    const duration = Math.max(to - from, 24 * 60 * 60 * 1000);
    range.compareFrom = new Date(from - duration).toISOString();
    range.compareTo = new Date(from - 1).toISOString();
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Revenue, conversion and engagement." />
      <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="analytics-from">
            From
          </label>
          <Input
            id="analytics-from"
            type="date"
            value={filters.from.slice(0, 10)}
            onChange={(event) =>
              setFrom(event.target.value ? `${event.target.value}T00:00:00.000Z` : "")
            }
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground" htmlFor="analytics-to">
            Through
          </label>
          <Input
            id="analytics-to"
            type="date"
            value={filters.to.slice(0, 10)}
            onChange={(event) =>
              setTo(event.target.value ? `${event.target.value}T23:59:59.999Z` : "")
            }
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={compare}
            onChange={(event) => setCompare(event.target.checked)}
          />
          Compare with preceding period
        </label>
      </div>

      <QueryBoundary
        fallback={<MetricCardsFallback count={4} />}
        errorMessage="Could not load subscription analytics."
      >
        <SubscriptionAnalyticsBlock range={range} />
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
        <EngagementAnalyticsBlock range={range} />
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
