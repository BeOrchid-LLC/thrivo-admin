"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/api";
import { env } from "@/lib/config/env";
import {
  fixtureOverviewMetrics,
  fixtureOverviewPlanBreakdown,
  fixtureOverviewRevenueTrend,
  fixtureOverviewTrialPipeline,
  resolveData,
} from "@/lib/fixtures";

function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function appendObjectRows(rows: string[][], section: string, value: unknown, prefix = ""): void {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, child]) =>
      appendObjectRows(rows, section, child, prefix ? `${prefix}.${key}` : key)
    );
    return;
  }
  rows.push([section, prefix, value == null ? "" : String(value), ""]);
}

export function DashboardExportButton({ range }: { range: { from?: string; to?: string } }) {
  const [exporting, setExporting] = useState(false);

  const exportDashboard = async () => {
    setExporting(true);
    try {
      const [metrics, revenue, pipeline, planBreakdown] = await Promise.all([
        resolveData({ metrics: fixtureOverviewMetrics }, () => callApi("GET_OVERVIEW_METRICS")),
        resolveData({ revenueTrend: fixtureOverviewRevenueTrend }, () =>
          callApi("GET_OVERVIEW_REVENUE_TREND", { query: range })
        ),
        resolveData({ trialPipeline: fixtureOverviewTrialPipeline }, () =>
          callApi("GET_OVERVIEW_TRIAL_PIPELINE", { query: range })
        ),
        resolveData({ planBreakdown: fixtureOverviewPlanBreakdown }, () =>
          callApi("GET_OVERVIEW_PLAN_BREAKDOWN")
        ),
      ]);
      const rows: string[][] = [["section", "label", "value", "date"]];
      appendObjectRows(rows, "metrics", metrics.metrics);
      revenue.revenueTrend.trend.forEach((point) =>
        rows.push(["revenue_trend", "revenue", String(point.value), point.date])
      );
      appendObjectRows(rows, "trial_pipeline", pipeline.trialPipeline);
      planBreakdown.planBreakdown.plans.forEach((point) =>
        rows.push(["plan_breakdown", point.plan, String(point.userCount), ""])
      );
      const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `thrivo-dashboard-${range.from?.slice(0, 10) ?? "all"}-${range.to?.slice(0, 10) ?? "now"}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(
        env.useFixtures ? "Fixture dashboard export downloaded." : "Dashboard export downloaded."
      );
    } catch {
      toast.error("Could not export dashboard data.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button variant="default" size="sm" onClick={exportDashboard} disabled={exporting}>
      <Download className="h-4 w-4" />
      {exporting ? "Exporting…" : "Export"}
    </Button>
  );
}
