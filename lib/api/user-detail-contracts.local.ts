import { z } from "zod";

/**
 * TEMPORARY local mirror of the extended admin user-detail contracts added to
 * `contracts/src/admin.ts` in thrivo-backend (device, convertedViaTrigger,
 * stats, extended subscription fields, timeline, activity). Unpublished as
 * of this commit — `@beorchid-llc/thrivo-contracts` needs a version bump +
 * publish before these can come from the real package.
 *
 * `lib/contracts/index.ts` re-exports 100% from the published package by
 * design. Since `GET_USER`'s response is being *extended* (not net-new
 * fields on a brand new endpoint), this file re-declares the full shape
 * locally rather than `.extend()`-ing the published schema across the
 * package boundary — keeps this file fully self-contained and disposable.
 *
 * DELETE THIS FILE once the package publishes a version containing these
 * fields, then point `GET_USER`/`GET_USER_TIMELINE`/`GET_USER_ACTIVITY` in
 * `endpoints.ts` back at `@/lib/contracts` and remove the `ud.` import there.
 */

const adminSubscriptionStatus = z.enum(["active", "trialing", "canceled", "expired", "none"]);

const userDetailSubscriptionSchema = z.object({
  status: adminSubscriptionStatus,
  priceLabel: z.string().nullable(),
  renewsAt: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  trialStartedAt: z.string().nullable(),
  trialConvertedAt: z.string().nullable(),
  firstChargeAt: z.string().nullable(),
  firstChargeAmountCents: z.number().int().nullable(),
  revenueToDateCents: z.number().int().nullable(),
  stripeCustomerId: z.string().nullable(),
  rcAppUserId: z.string().nullable(),
});

const userDeviceSchema = z.object({
  platform: z.enum(["ios", "android"]).nullable(),
  osVersion: z.string().nullable(),
  deviceModel: z.string().nullable(),
});

const userStatsSchema = z.object({
  currentStreakDays: z.number().int(),
  totalFoodLogs: z.number().int(),
  totalWeightLogs: z.number().int(),
  totalCheckIns: z.number().int(),
  avgDailyKcal: z.number().int().nullable(),
});

/** Base user-profile fields, mirroring `userProfileSchema` + admin extras —
 *  same shape as the published `adminUserDetailSchema` today, plus the new
 *  device/convertedViaTrigger/stats fields and the extended subscription. */
export const userDetailSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  goal: z.enum(["lose", "maintain", "gain"]).nullable(),
  sex: z.enum(["male", "female", "prefer_not_to_say"]).nullable(),
  age: z.number().nullable(),
  heightCm: z.string().nullable(),
  weightKg: z.string().nullable(),
  targetWeightKg: z.string().nullable(),
  tdeeKcal: z.number().nullable(),
  dailyTargetKcal: z.number().nullable(),
  targetProteinG: z.number().nullable(),
  targetCarbsG: z.number().nullable(),
  targetFatG: z.number().nullable(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).nullable(),
  manualDailyTargetKcal: z.number().nullable(),
  notifyTimes: z.array(z.string()).nullable(),
  timezone: z.string().nullable(),
  tier: z.enum(["free", "premium"]),
  accountStatus: z.string(),
  trialEndsAt: z.coerce.date().nullable(),
  onboardingStep: z.number(),
  isOnboarded: z.boolean(),
  isOnboardingSkipped: z.boolean(),
  onboardingSkipped: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  subscriptionStatus: z.string().nullable(),
  status: z.enum(["active", "suspended", "deleted"]),
  lastActiveAt: z.string().nullable(),
  totalFoodLogs: z.number().int(),
  currentStreakDays: z.number().int(),
  subscription: userDetailSubscriptionSchema.nullable(),
  device: userDeviceSchema.nullable(),
  convertedViaTrigger: z.string().nullable(),
  stats: userStatsSchema,
});
export type UserDetail = z.infer<typeof userDetailSchema>;

export const userDetailResponseSchema = z.object({ user: userDetailSchema });
export type UserDetailResponse = z.infer<typeof userDetailResponseSchema>;

const timelineEntryType = z.enum([
  "account_created",
  "onboarding_completed",
  "upgrade_prompt_shown",
  "trial_started",
  "trial_converted",
  "trial_cancelled",
  "renewed",
  "expired",
  "next_charge_scheduled",
]);

export const timelineEntrySchema = z.object({
  type: timelineEntryType,
  title: z.string(),
  subtitle: z.string().nullable(),
  occurredAt: z.string(),
  status: z.enum(["completed", "scheduled"]),
});
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

export const userTimelineResponseSchema = z.object({
  timeline: z.array(timelineEntrySchema),
});
export type UserTimelineResponse = z.infer<typeof userTimelineResponseSchema>;

export const activityTypeSchema = z.enum(["food_logs", "check_ins", "weight_logs"]);
export type ActivityType = z.infer<typeof activityTypeSchema>;

const activityFoodLogItem = z.object({
  id: z.string(),
  name: z.string(),
  localDate: z.string(),
  servingQty: z.number().nullable(),
  servingUnit: z.string().nullable(),
  kcal: z.number().int(),
});

const activityCheckInItem = z.object({
  id: z.string(),
  localDate: z.string(),
  mood: z.string(),
  note: z.string().nullable(),
});

const activityWeightLogItem = z.object({
  id: z.string(),
  localDate: z.string(),
  weightKg: z.number(),
  note: z.string().nullable(),
});

export const activityItemSchema = z.union([
  activityFoodLogItem,
  activityCheckInItem,
  activityWeightLogItem,
]);
export type ActivityFoodLogItem = z.infer<typeof activityFoodLogItem>;
export type ActivityCheckInItem = z.infer<typeof activityCheckInItem>;
export type ActivityWeightLogItem = z.infer<typeof activityWeightLogItem>;

export const userActivityResponseSchema = z.object({
  items: z.array(activityItemSchema),
  total: z.number().int(),
  limit: z.number().int(),
});
export type UserActivityResponse = z.infer<typeof userActivityResponseSchema>;
