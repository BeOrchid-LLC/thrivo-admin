import { QueryBoundary } from "@/components/general/QueryBoundary";
import { PageHeader } from "@/components/general/PageHeader";
import { MetricCardsFallback } from "@/components/general/skeletons/MetricCardsFallback";
import { ChartCardFallback } from "@/components/general/skeletons/ChartCardFallback";
import { DashboardMetricCards } from "./DashboardMetricCards";
import { DashboardGrowthChart } from "./DashboardGrowthChart";

export function DashboardSection() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Revenue, growth and engagement at a glance." />

      <QueryBoundary fallback={<MetricCardsFallback />}>
        <DashboardMetricCards />
      </QueryBoundary>

      <QueryBoundary fallback={<ChartCardFallback />}>
        <DashboardGrowthChart />
      </QueryBoundary>
    </div>
  );
}
