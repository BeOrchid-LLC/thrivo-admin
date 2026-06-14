import { z } from "zod";
import { timePointSchema } from "./common";

/** Top KPI tiles for the dashboard (all server-computed). */
export const dashboardMetricsSchema = z.object({
  mrrCents: z.number(),
  activeSubscribers: z.number(),
  dau: z.number(),
  mau: z.number(),
  churnRate: z.number(), // 0..1
  subscriberGrowth: z.array(timePointSchema),
});
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
export const dashboardMetricsResponse = z.object({ metrics: dashboardMetricsSchema });
export type DashboardMetricsResponse = z.infer<typeof dashboardMetricsResponse>;

/** Subscription/revenue analytics. */
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
export const subscriptionAnalyticsResponse = z.object({ analytics: subscriptionAnalyticsSchema });
export type SubscriptionAnalyticsResponse = z.infer<typeof subscriptionAnalyticsResponse>;

/** Engagement analytics (Mixpanel-backed). */
export const engagementAnalyticsSchema = z.object({
  onboardingFunnel: z.array(z.object({ step: z.string(), count: z.number() })),
  topFoods: z.array(z.object({ name: z.string(), count: z.number() })),
  averageStreakDays: z.number(),
  pushOpenRate: z.number(), // 0..1
  retention: z.array(z.object({ cohort: z.string(), week: z.number(), retained: z.number() })),
});
export type EngagementAnalytics = z.infer<typeof engagementAnalyticsSchema>;
export const engagementAnalyticsResponse = z.object({ analytics: engagementAnalyticsSchema });
export type EngagementAnalyticsResponse = z.infer<typeof engagementAnalyticsResponse>;
