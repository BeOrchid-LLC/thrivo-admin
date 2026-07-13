"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { callApi, queryKeys } from "@/lib/api";
import { POLL_INTERVALS } from "@/lib/query/make-query-client";
import { fixtureOverviewPlanBreakdown, resolveData } from "@/lib/fixtures";
import { formatCents, formatNumber } from "@/lib/format";
import { PlanRow } from "./PlanRow";

export const overviewPlanBreakdownQuery = {
  queryKey: queryKeys.overview.planBreakdown(),
  queryFn: () =>
    resolveData({ planBreakdown: fixtureOverviewPlanBreakdown }, () =>
      callApi("GET_OVERVIEW_PLAN_BREAKDOWN")
    ),
  refetchInterval: POLL_INTERVALS.dashboard,
};

/** "Plan breakdown — N premium" mini-list: one row per plan with a share bar. */
export function OverviewPlanBreakdown() {
  const { data } = useSuspenseQuery(overviewPlanBreakdownQuery);
  const { totalPremium, plans } = data.planBreakdown;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-foreground">
        Plan breakdown — {formatNumber(totalPremium)} premium
      </p>
      <div className="space-y-4">
        {plans.map((plan) => (
          <PlanRow
            key={plan.plan}
            label={`${plan.plan === "monthly" ? "Monthly" : "Annual"} (${plan.priceLabel})`}
            statsLine={`${formatNumber(plan.userCount)} users · ${formatCents(plan.mrrCents)}${
              plan.plan === "annual" ? " MRR equiv." : " MRR"
            }`}
            pct={totalPremium > 0 ? (plan.userCount / totalPremium) * 100 : 0}
          />
        ))}
      </div>
    </div>
  );
}
