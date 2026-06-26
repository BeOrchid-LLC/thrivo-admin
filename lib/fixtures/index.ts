import { env } from "@/lib/config/env";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type {
  AdminUser,
  AdminUserDetail,
  AuditLogEntry,
  DashboardMetrics,
  EmailLog,
  EngagementAnalytics,
  PaginationMeta,
  SubscriptionAnalytics,
  SubscriptionRow,
  Tip,
} from "@/lib/contracts";

/**
 * Clearly-labeled placeholder data, used only while the backend `/admin/*`
 * endpoints don't exist (gated by `env.useFixtures`). Delete this folder and the
 * `resolveData` calls once the API is live.
 */

/** Return fixture data when fixtures are on; otherwise run the live fetcher. */
export async function resolveData<T>(fixture: T, live: () => Promise<T>): Promise<T> {
  return env.useFixtures ? fixture : live();
}

const meta = (total: number): PaginationMeta => ({
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  total,
  totalPages: Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE)),
});

const fixtureUserIds = {
  ada: "019f0399-7e9e-7401-8a25-32b509196dde",
  ben: "019f0399-7f0e-776a-8c7f-f6bf7d37cacf",
  chidi: "019f0399-86fe-75e7-a037-3ec74d09e16c",
  dana: "019f0399-92b3-72db-9bf6-a2a031ad518c",
} as const;

function fixtureAdminUser(
  overrides: Partial<AdminUserDetail> & Pick<AdminUserDetail, "id" | "email">
): AdminUserDetail {
  return {
    name: "Ada Obi",
    goal: "lose",
    sex: "female",
    age: 34,
    heightCm: "170.0",
    weightKg: "68.0",
    targetWeightKg: "64.0",
    tdeeKcal: 2200,
    dailyTargetKcal: 1800,
    targetProteinG: 130,
    targetCarbsG: 180,
    targetFatG: 60,
    activityLevel: "moderate",
    manualDailyTargetKcal: null,
    notifyTimes: ["08:00:00", "13:00:00"],
    timezone: "Africa/Lagos",
    tier: "premium",
    accountStatus: "paid",
    trialEndsAt: null,
    onboardingStep: 7,
    isOnboarded: true,
    isOnboardingSkipped: false,
    onboardingSkipped: false,
    createdAt: new Date("2026-05-02T09:12:00.000Z"),
    updatedAt: new Date("2026-06-14T07:40:00.000Z"),
    deletedAt: null,
    subscriptionStatus: "active",
    status: "active",
    lastActiveAt: "2026-06-14T07:40:00.000Z",
    totalFoodLogs: 412,
    currentStreakDays: 23,
    subscription: {
      status: "active",
      priceLabel: "$14.99/mo",
      renewsAt: "2026-07-02T09:12:00.000Z",
      cancelAtPeriodEnd: false,
    },
    ...overrides,
  };
}

export const fixtureUsers: AdminUser[] = [
  fixtureAdminUser({
    id: fixtureUserIds.ada,
    email: "ada@example.com",
    name: "Ada Obi",
    tier: "premium",
  }),
  fixtureAdminUser({
    id: fixtureUserIds.ben,
    email: "ben@example.com",
    name: "Ben Carter",
    tier: "free",
    accountStatus: "free_plan",
    status: "active",
    subscription: null,
    totalFoodLogs: 88,
    currentStreakDays: 4,
    createdAt: new Date("2026-05-11T14:03:00.000Z"),
    updatedAt: new Date("2026-06-13T19:21:00.000Z"),
    lastActiveAt: "2026-06-13T19:21:00.000Z",
  }),
  fixtureAdminUser({
    id: fixtureUserIds.chidi,
    email: "chidi@example.com",
    name: "Chidi Eze",
    tier: "premium",
    createdAt: new Date("2026-04-21T11:30:00.000Z"),
    updatedAt: new Date("2026-06-12T08:05:00.000Z"),
    lastActiveAt: "2026-06-12T08:05:00.000Z",
  }),
  fixtureAdminUser({
    id: fixtureUserIds.dana,
    email: "dana@example.com",
    name: null,
    tier: "free",
    accountStatus: "dormant",
    status: "suspended",
    onboardingStep: 2,
    isOnboarded: false,
    lastActiveAt: null,
    subscription: null,
    createdAt: new Date("2026-03-18T16:45:00.000Z"),
    updatedAt: new Date("2026-03-18T16:45:00.000Z"),
  }),
];

export const fixtureUsersPage = { items: fixtureUsers, pagination: meta(fixtureUsers.length) };

export const fixtureUserDetail: AdminUserDetail = fixtureUsers[0];

export const fixtureSubscriptions: SubscriptionRow[] = [
  {
    id: "s_001",
    userId: fixtureUserIds.ada,
    userEmail: "ada@example.com",
    entitlement: "premium",
    status: "active",
    priceLabel: "$14.99/mo",
    upgradeTrigger: "macros_tap",
    startedAt: "2026-05-02T09:12:00.000Z",
    renewsAt: "2026-07-02T09:12:00.000Z",
  },
  {
    id: "s_002",
    userId: fixtureUserIds.chidi,
    userEmail: "chidi@example.com",
    entitlement: "premium",
    status: "trialing",
    priceLabel: "$14.99/mo",
    upgradeTrigger: "streak_3day",
    startedAt: "2026-06-10T10:00:00.000Z",
    renewsAt: "2026-06-17T10:00:00.000Z",
  },
];

export const fixtureSubscriptionsPage = {
  items: fixtureSubscriptions,
  pagination: meta(fixtureSubscriptions.length),
};

export const fixtureDashboardMetrics: DashboardMetrics = {
  mrrCents: 432000,
  activeSubscribers: 288,
  dau: 1240,
  mau: 5130,
  churnRate: 0.041,
  subscriberGrowth: [
    { date: "2026-01", value: 40 },
    { date: "2026-02", value: 88 },
    { date: "2026-03", value: 142 },
    { date: "2026-04", value: 196 },
    { date: "2026-05", value: 244 },
    { date: "2026-06", value: 288 },
  ],
};

export const fixtureSubscriptionAnalytics: SubscriptionAnalytics = {
  mrrCents: 432000,
  mrrTrend: fixtureDashboardMetrics.subscriberGrowth.map((p) => ({
    date: p.date,
    value: p.value * 1499,
  })),
  churnTrend: [
    { date: "2026-03", value: 0.06 },
    { date: "2026-04", value: 0.052 },
    { date: "2026-05", value: 0.045 },
    { date: "2026-06", value: 0.041 },
  ],
  trialStarts: 96,
  trialConversions: 61,
  cancellations: 12,
  freeCount: 1820,
  premiumCount: 288,
  upgradeTriggers: [
    { trigger: "macros_tap", count: 124 },
    { trigger: "streak_3day", count: 92 },
    { trigger: "history_limit", count: 72 },
  ],
};

export const fixtureEngagementAnalytics: EngagementAnalytics = {
  onboardingFunnel: [
    { step: "welcome", count: 1000 },
    { step: "sign_in", count: 820 },
    { step: "goal", count: 760 },
    { step: "target", count: 690 },
    { step: "start_free", count: 642 },
    { step: "premium_offer", count: 612 },
  ],
  topFoods: [
    { name: "Banana", count: 1840 },
    { name: "Chicken breast", count: 1520 },
    { name: "White rice", count: 1330 },
    { name: "Greek yogurt", count: 1190 },
  ],
  averageStreakDays: 11.4,
  pushOpenRate: 0.38,
  retention: [
    { cohort: "2026-W20", week: 1, retained: 0.72 },
    { cohort: "2026-W20", week: 2, retained: 0.58 },
    { cohort: "2026-W20", week: 3, retained: 0.49 },
  ],
};

export const fixtureTips: Tip[] = [
  {
    id: "t_001",
    body: "Protein at breakfast curbs cravings later — aim for 25–30g.",
    mood: "low",
    isActive: true,
    pinnedDate: null,
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "t_002",
    body: "A short walk after meals helps blood-sugar response.",
    mood: "okay",
    isActive: true,
    pinnedDate: null,
    updatedAt: "2026-06-03T10:00:00.000Z",
  },
  {
    id: "t_003",
    body: "Consistency beats perfection — log it even when it's not ideal.",
    mood: null,
    isActive: false,
    pinnedDate: null,
    updatedAt: "2026-05-20T10:00:00.000Z",
  },
];

export const fixtureTipsPage = { items: fixtureTips, pagination: meta(fixtureTips.length) };

export const fixtureEmailLogs: EmailLog[] = [
  {
    id: "e_001",
    to: "ada@example.com",
    template: "welcome",
    status: "sent",
    error: null,
    createdAt: "2026-06-14T07:00:00.000Z",
  },
  {
    id: "e_002",
    to: "ben@example.com",
    template: "trial_ending",
    status: "bounced",
    error: "mailbox full",
    createdAt: "2026-06-13T06:30:00.000Z",
  },
];

export const fixtureEmailLogsPage = {
  items: fixtureEmailLogs,
  pagination: meta(fixtureEmailLogs.length),
};

export const fixtureAuditLog: AuditLogEntry[] = [
  {
    id: "a_001",
    actorEmail: "ops@beorchid.com",
    action: "subscription.cancel",
    targetType: "user",
    targetId: "u_004",
    requestId: "req_9a1b",
    createdAt: "2026-06-13T12:10:00.000Z",
  },
  {
    id: "a_002",
    actorEmail: "ops@beorchid.com",
    action: "tip.update",
    targetType: "tip",
    targetId: "t_003",
    requestId: "req_7c2d",
    createdAt: "2026-06-12T15:42:00.000Z",
  },
];

export const fixtureAuditLogPage = {
  items: fixtureAuditLog,
  pagination: meta(fixtureAuditLog.length),
};
