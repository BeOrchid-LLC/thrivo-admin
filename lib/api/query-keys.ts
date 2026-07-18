/**
 * Centralized query-key factories (ADMIN_ARCHITECTURE §5). Reference these so
 * polling/invalidation stays precise and typo-free.
 */
export interface ListParams {
  page?: number;
  pageSize?: number;
  /** Keyset cursor (R5-4: users, leads only — see `useCursorPagination`). */
  cursor?: string;
  /** Keyset page size (R5-4: users, leads only). */
  limit?: number;
  search?: string;
  status?: string;
}

export const queryKeys = {
  session: () => ["session"] as const,

  users: {
    list: (params: ListParams) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    timeline: (id: string) => ["users", "detail", id, "timeline"] as const,
    activity: (id: string, type: string) => ["users", "detail", id, "activity", type] as const,
  },

  subscriptions: {
    list: (params: ListParams) => ["subscriptions", "list", params] as const,
  },

  leads: {
    list: (params: ListParams) => ["leads", "list", params] as const,
  },

  metrics: {
    dashboard: () => ["metrics", "dashboard"] as const,
  },

  overview: {
    metrics: () => ["overview", "metrics"] as const,
    revenueTrend: () => ["overview", "revenue-trend"] as const,
    trialPipeline: () => ["overview", "trial-pipeline"] as const,
    planBreakdown: () => ["overview", "plan-breakdown"] as const,
    recentUsers: () => ["overview", "recent-users"] as const,
  },

  analytics: {
    subscriptions: () => ["analytics", "subscriptions"] as const,
    engagement: () => ["analytics", "engagement"] as const,
  },

  tips: {
    list: (params: ListParams) => ["tips", "list", params] as const,
  },

  foods: {
    list: (params: ListParams & { tier?: string; origin?: string }) =>
      ["foods", "list", params] as const,
    detail: (id: string) => ["foods", "detail", id] as const,
  },

  emailLogs: {
    list: (params: ListParams) => ["email-logs", "list", params] as const,
  },

  auditLog: {
    list: (params: ListParams) => ["audit-log", "list", params] as const,
  },
} as const;
