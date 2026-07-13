import { z } from "zod";

/**
 * TEMPORARY local mirror of the admin-overview Zod contracts added to
 * `contracts/src/admin-analytics.ts` in thrivo-backend. Unpublished as of
 * this commit — `@beorchid-llc/thrivo-contracts` needs a version bump +
 * publish before these can come from the real package.
 *
 * `lib/contracts/index.ts` re-exports 100% from the published package by
 * design ("the previously-local files are gone" — see its docstring). These
 * 4 schemas intentionally live OUTSIDE that barrel instead of inside it, so
 * they don't quietly become a second precedent for local contracts here.
 *
 * DELETE THIS FILE once the package publishes a version containing
 * `adminOverview*Schema`, then point the 4 ENDPOINTS entries in `endpoints.ts`
 * back at `@/lib/contracts` and remove the `ov.` import there.
 */

const timePoint = z.object({ date: z.string(), value: z.number() });

export const overviewMetricsResponse = z.object({
  metrics: z.object({
    mrr: z.object({ cents: z.number(), deltaPct: z.number().nullable() }),
    arr: z.object({ cents: z.number(), deltaPct: z.number().nullable() }),
    premiumUsers: z.object({ total: z.number(), monthly: z.number(), annual: z.number() }),
    churnRate: z.object({ pct: z.number(), churnedMrrCents: z.number() }),
    dauMau: z.object({
      dau: z.number(),
      mau: z.number(),
      totalUsers: z.number(),
      ratioPct: z.number(),
    }),
  }),
});
export type OverviewMetricsResponse = z.infer<typeof overviewMetricsResponse>;

export const overviewRevenueTrendResponse = z.object({
  revenueTrend: z.object({
    trend: z.array(timePoint),
    newMrrCents: z.number(),
    churnedMrrCents: z.number(),
    netNewMrrCents: z.number(),
  }),
});
export type OverviewRevenueTrendResponse = z.infer<typeof overviewRevenueTrendResponse>;

export const overviewTrialPipelineResponse = z.object({
  trialPipeline: z.object({
    started: z.number(),
    converted: z.number(),
    convertedPct: z.number(),
    cancelled: z.number(),
    cancelledPct: z.number(),
    activePct: z.number(),
  }),
});
export type OverviewTrialPipelineResponse = z.infer<typeof overviewTrialPipelineResponse>;

export const overviewPlanBreakdownResponse = z.object({
  planBreakdown: z.object({
    totalPremium: z.number(),
    plans: z.array(
      z.object({
        plan: z.enum(["monthly", "annual"]),
        priceLabel: z.string(),
        userCount: z.number(),
        mrrCents: z.number(),
      })
    ),
  }),
});
export type OverviewPlanBreakdownResponse = z.infer<typeof overviewPlanBreakdownResponse>;
