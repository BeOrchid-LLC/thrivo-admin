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
  kind?: string;
  /** General search / filter term passed to the backing endpoint. */
  q?: string;
  targetId?: string;
  owner?: string;
  reconciled?: string;
  from?: string;
  to?: string;
  requestId?: string;
  template?: string;
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
    detail: (id: string) => ["leads", "detail", id] as const,
  },

  metrics: {
    dashboard: () => ["metrics", "dashboard"] as const,
  },

  overview: {
    metrics: () => ["overview", "metrics"] as const,
    revenueTrend: (params: { from?: string; to?: string } = {}) =>
      ["overview", "revenue-trend", params] as const,
    trialPipeline: (params: { from?: string; to?: string } = {}) =>
      ["overview", "trial-pipeline", params] as const,
    planBreakdown: () => ["overview", "plan-breakdown"] as const,
    recentUsers: () => ["overview", "recent-users"] as const,
  },

  analytics: {
    subscriptions: (
      params: { from?: string; to?: string; compareFrom?: string; compareTo?: string } = {}
    ) => ["analytics", "subscriptions", params] as const,
    engagement: (
      params: { from?: string; to?: string; compareFrom?: string; compareTo?: string } = {}
    ) => ["analytics", "engagement", params] as const,
  },

  tips: {
    list: (params: ListParams) => ["tips", "list", params] as const,
  },

  foods: {
    list: (params: ListParams & { tier?: string; origin?: string }) =>
      ["foods", "list", params] as const,
    detail: (id: string) => ["foods", "detail", id] as const,
  },

  billing: {
    events: (params: ListParams & { eventType?: string }) => ["billing", "events", params] as const,
    userEvents: (id: string) => ["billing", "user-events", id] as const,
    webhooks: (params: ListParams & { provider?: string }) =>
      ["billing", "webhooks", params] as const,
    webhookDetail: (id: string) => ["billing", "webhook", id] as const,
  },

  push: {
    campaigns: (params: ListParams) => ["push", "campaigns", params] as const,
    campaign: (id: string) => ["push", "campaign", id] as const,
  },

  moderation: {
    notes: (params: ListParams) => ["moderation", "notes", params] as const,
    uploads: (params: ListParams) => ["moderation", "uploads", params] as const,
  },

  emailLogs: {
    list: (params: ListParams) => ["email-logs", "list", params] as const,
    detail: (id: string) => ["email-logs", "detail", id] as const,
  },

  auditLog: {
    list: (params: ListParams) => ["audit-log", "list", params] as const,
    detail: (id: string) => ["audit-log", "detail", id] as const,
  },

  admins: {
    list: () => ["admins", "list"] as const,
    detail: (id: string) => ["admins", "detail", id] as const,
  },

  settings: {
    admin: () => ["settings", "admin"] as const,
  },

  accountErasures: (params: { page: number; status: string; search?: string }) =>
    ["account-erasures", params] as const,
} as const;
