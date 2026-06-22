import { z } from "zod";
import { timePointSchema } from "@beorchid-llc/thrivo-contracts";

export const dashboardMetricsSchema = z.object({
  mrrCents: z.number(),
  activeSubscribers: z.number(),
  dau: z.number(),
  mau: z.number(),
  churnRate: z.number(),
  subscriberGrowth: z.array(timePointSchema),
});
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
/** Endpoint response: `{ metrics: DashboardMetrics }` (unwrapped by the API client). */
export const dashboardMetricsResponse = z.object({ metrics: dashboardMetricsSchema });

export const subscriptionAnalyticsSchema = z.object({
  mrrCents: z.number(),
  mrrTrend: z.array(timePointSchema),
  churnTrend: z.array(timePointSchema),
  trialStarts: z.number(),
  trialConversions: z.number(),
  cancellations: z.number(),
  freeCount: z.number(),
  premiumCount: z.number(),
  upgradeTriggers: z.array(z.object({ trigger: z.string(), count: z.number() })),
});
export type SubscriptionAnalytics = z.infer<typeof subscriptionAnalyticsSchema>;
/** Endpoint response: `{ analytics: SubscriptionAnalytics }` */
export const subscriptionAnalyticsResponse = z.object({ analytics: subscriptionAnalyticsSchema });

export const engagementAnalyticsSchema = z.object({
  onboardingFunnel: z.array(z.object({ step: z.string(), count: z.number() })),
  topFoods: z.array(z.object({ name: z.string(), count: z.number() })),
  averageStreakDays: z.number(),
  pushOpenRate: z.number(),
  retention: z.array(z.object({ cohort: z.string(), week: z.number(), retained: z.number() })),
});
export type EngagementAnalytics = z.infer<typeof engagementAnalyticsSchema>;
/** Endpoint response: `{ analytics: EngagementAnalytics }` */
export const engagementAnalyticsResponse = z.object({ analytics: engagementAnalyticsSchema });
