"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/TrendChart";
import { formatNumber } from "@/lib/format";
import { dashboardQuery } from "./DashboardMetricCards";

/** Subscriber growth chart — shares dashboard query cache with metric cards. */
export function DashboardGrowthChart() {
  const { data } = useSuspenseQuery(dashboardQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscriber growth</CardTitle>
      </CardHeader>
      <CardContent>
        <TrendChart data={data.metrics.subscriberGrowth} formatValue={formatNumber} />
      </CardContent>
    </Card>
  );
}
