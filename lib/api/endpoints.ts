import { z } from "zod";
import { userProfileSchema } from "@beorchid-llc/thrivo-contracts/users";
import * as c from "@/lib/contracts";

/**
 * The single source of truth for the admin backend contract (`/api/v1/admin/*`),
 * adapted from the pinpoint-admin `endpoints.ts` pattern. Each entry declares an
 * endpoint's `path`, `method`, whether `auth` is enforced, and the Zod schemas
 * for its request `payload` and success `response` (the unwrapped `data`).
 * Request/response TYPES are inferred from the schemas, so the runtime contract
 * and the static types can never drift. `callApi` / `callServerApi` are the only
 * consumers.
 */
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface EndpointConfig {
  path: string;
  method: HttpMethod;
  /** Whether the route requires an authenticated admin session. */
  auth: boolean;
  payload?: z.ZodTypeAny;
  response: z.ZodTypeAny;
}

export const ENDPOINTS = {
  // --- Shared user contract (published package) ---
  GET_ME: {
    path: "/users/me",
    method: "GET",
    auth: true,
    response: userProfileSchema,
  },

  // --- Auth (staff login via email OTP) ---
  GET_SESSION: {
    path: "/admin/auth/session",
    method: "GET",
    auth: false,
    response: c.sessionResponse,
  },
  REQUEST_OTP: {
    path: "/admin/auth/request-otp",
    method: "POST",
    auth: false,
    payload: c.requestOtpPayload,
    response: c.ackSchema,
  },
  VERIFY_OTP: {
    path: "/admin/auth/verify-otp",
    method: "POST",
    auth: false,
    payload: c.verifyOtpPayload,
    response: c.sessionResponse,
  },
  LOGOUT: { path: "/admin/auth/logout", method: "POST", auth: true, response: c.ackSchema },

  // --- Users ---
  LIST_USERS: {
    path: "/admin/users",
    method: "GET",
    auth: true,
    // R5-4: keyset-paginated (page/pageSize no longer accepted server-side).
    response: c.userListResponse,
  },
  GET_USER: {
    path: "/admin/users/:id",
    method: "GET",
    auth: true,
    response: c.userDetailResponse,
  },
  GET_USER_TIMELINE: {
    path: "/admin/users/:id/timeline",
    method: "GET",
    auth: true,
    response: c.userTimelineResponse,
  },
  GET_USER_ACTIVITY: {
    path: "/admin/users/:id/activity",
    method: "GET",
    auth: true,
    response: c.userActivityResponse,
  },
  DELETE_USER: {
    path: "/admin/users/:id",
    method: "DELETE",
    auth: true,
    response: c.ackSchema,
  },
  CANCEL_SUBSCRIPTION: {
    path: "/admin/users/:id/subscription/cancel",
    method: "POST",
    auth: true,
    payload: c.cancelPayload,
    response: c.userDetailResponse,
  },
  REFUND_SUBSCRIPTION: {
    path: "/admin/users/:id/subscription/refund",
    method: "POST",
    auth: true,
    payload: c.refundPayload,
    response: c.userDetailResponse,
  },
  EXPORT_USERS: {
    path: "/admin/users/export",
    method: "GET",
    auth: true,
    response: c.exportResponse,
  },

  // --- Leads (email captures) ---
  // Export isn't listed here: it streams a CSV body, not JSON, so it doesn't
  // fit callApi's response-schema contract. LeadsSection fetches it directly.
  LIST_LEADS: {
    path: "/admin/leads",
    method: "GET",
    auth: true,
    // R5-4: keyset-paginated (page/pageSize no longer accepted server-side).
    response: c.leadListResponse,
  },
  DELETE_LEAD: {
    path: "/admin/leads/:id",
    method: "DELETE",
    auth: true,
    response: c.ackSchema,
  },

  // --- Subscriptions ---
  LIST_SUBSCRIPTIONS: {
    path: "/admin/subscriptions",
    method: "GET",
    auth: true,
    response: c.paginated(c.subscriptionRowSchema),
  },

  // --- Metrics & analytics ---
  GET_DASHBOARD_METRICS: {
    path: "/admin/metrics/dashboard",
    method: "GET",
    auth: true,
    response: c.dashboardMetricsResponse,
  },
  GET_SUBSCRIPTION_ANALYTICS: {
    path: "/admin/analytics/subscriptions",
    method: "GET",
    auth: true,
    response: c.subscriptionAnalyticsResponse,
  },
  GET_ENGAGEMENT_ANALYTICS: {
    path: "/admin/analytics/engagement",
    method: "GET",
    auth: true,
    response: c.engagementAnalyticsResponse,
  },

  // --- Overview page — one endpoint per independently-fetched section ---
  GET_OVERVIEW_METRICS: {
    path: "/admin/overview/metrics",
    method: "GET",
    auth: true,
    response: c.overviewMetricsResponse,
  },
  GET_OVERVIEW_REVENUE_TREND: {
    path: "/admin/overview/revenue-trend",
    method: "GET",
    auth: true,
    response: c.overviewRevenueTrendResponse,
  },
  GET_OVERVIEW_TRIAL_PIPELINE: {
    path: "/admin/overview/trial-pipeline",
    method: "GET",
    auth: true,
    response: c.overviewTrialPipelineResponse,
  },
  GET_OVERVIEW_PLAN_BREAKDOWN: {
    path: "/admin/overview/plan-breakdown",
    method: "GET",
    auth: true,
    response: c.overviewPlanBreakdownResponse,
  },

  // --- Content (psychology tip bank) ---
  LIST_TIPS: { path: "/admin/tips", method: "GET", auth: true, response: c.paginated(c.tipSchema) },
  CREATE_TIP: {
    path: "/admin/tips",
    method: "POST",
    auth: true,
    payload: c.upsertTipPayload,
    response: c.tipResponse,
  },
  UPDATE_TIP: {
    path: "/admin/tips/:id",
    method: "PATCH",
    auth: true,
    payload: c.upsertTipPayload,
    response: c.tipResponse,
  },
  DELETE_TIP: { path: "/admin/tips/:id", method: "DELETE", auth: true, response: c.ackSchema },

  // --- Food catalog moderation ---
  LIST_FOODS: {
    path: "/admin/foods",
    method: "GET",
    auth: true,
    response: c.foodListResponse,
  },
  GET_FOOD: {
    path: "/admin/foods/:id",
    method: "GET",
    auth: true,
    response: c.foodDetailResponse,
  },
  APPROVE_FOOD: {
    path: "/admin/foods/:id/approve",
    method: "POST",
    auth: true,
    response: c.foodDetailResponse,
  },
  REJECT_FOOD: {
    path: "/admin/foods/:id/reject",
    method: "POST",
    auth: true,
    payload: c.foodRejectPayload,
    response: c.foodDetailResponse,
  },
  VERIFY_FOOD: {
    path: "/admin/foods/:id/verify",
    method: "POST",
    auth: true,
    response: c.foodDetailResponse,
  },
  EDIT_FOOD: {
    path: "/admin/foods/:id",
    method: "PATCH",
    auth: true,
    payload: c.foodEditPayload,
    response: c.foodDetailResponse,
  },
  MERGE_FOOD: {
    path: "/admin/foods/:id/merge",
    method: "POST",
    auth: true,
    payload: c.foodMergePayload,
    response: c.foodDetailResponse,
  },

  // --- Billing observability ---
  LIST_BILLING_EVENTS: {
    path: "/admin/billing/events",
    method: "GET",
    auth: true,
    response: c.subscriptionEventListResponse,
  },
  GET_USER_BILLING_EVENTS: {
    path: "/admin/users/:id/billing-events",
    method: "GET",
    auth: true,
    response: c.userBillingEventsResponse,
  },
  RECONCILE_SUBSCRIPTION: {
    path: "/admin/users/:id/reconcile-subscription",
    method: "POST",
    auth: true,
    response: c.ackSchema,
  },
  LIST_WEBHOOKS: {
    path: "/admin/webhooks",
    method: "GET",
    auth: true,
    response: c.webhookEventListResponse,
  },
  GET_WEBHOOK: {
    path: "/admin/webhooks/:id",
    method: "GET",
    auth: true,
    response: c.webhookEventDetailResponse,
  },

  // --- Push campaigns ---
  LIST_PUSH_CAMPAIGNS: {
    path: "/admin/push/campaigns",
    method: "GET",
    auth: true,
    response: c.pushCampaignListResponse,
  },
  GET_PUSH_CAMPAIGN: {
    path: "/admin/push/campaigns/:id",
    method: "GET",
    auth: true,
    response: c.pushCampaignDetailResponse,
  },
  ESTIMATE_PUSH_AUDIENCE: {
    path: "/admin/push/audience-estimate",
    method: "POST",
    auth: true,
    payload: c.audienceEstimatePayload,
    response: c.audienceEstimateResponse,
  },
  CREATE_PUSH_CAMPAIGN: {
    path: "/admin/push/campaigns",
    method: "POST",
    auth: true,
    payload: c.createCampaignPayload,
    response: c.pushCampaignDetailResponse,
  },
  SEND_PUSH_CAMPAIGN: {
    path: "/admin/push/campaigns/:id/send",
    method: "POST",
    auth: true,
    response: c.pushCampaignDetailResponse,
  },

  // --- UGC moderation ---
  LIST_CHECKIN_NOTES: {
    path: "/admin/moderation/checkin-notes",
    method: "GET",
    auth: true,
    response: c.checkinNoteListResponse,
  },
  REDACT_CHECKIN_NOTE: {
    path: "/admin/checkins/:id/redact",
    method: "POST",
    auth: true,
    response: c.ackSchema,
  },
  RESTORE_CHECKIN_NOTE: {
    path: "/admin/checkins/:id/restore",
    method: "POST",
    auth: true,
    response: c.ackSchema,
  },
  LIST_MODERATION_UPLOADS: {
    path: "/admin/moderation/uploads",
    method: "GET",
    auth: true,
    response: c.uploadListResponse,
  },
  REMOVE_UPLOAD: {
    path: "/admin/uploads/:id/remove",
    method: "POST",
    auth: true,
    response: c.ackSchema,
  },

  // --- Logs ---
  LIST_EMAIL_LOGS: {
    path: "/admin/email-logs",
    method: "GET",
    auth: true,
    response: c.paginated(c.emailLogSchema),
  },
  LIST_AUDIT_LOG: {
    path: "/admin/audit-log",
    method: "GET",
    auth: true,
    response: c.paginated(c.auditLogEntrySchema),
  },
} satisfies Record<string, EndpointConfig>;

export type Endpoints = typeof ENDPOINTS;
export type EndpointKey = keyof Endpoints;

export type EndpointPayload<K extends EndpointKey> = Endpoints[K] extends {
  payload: infer P extends z.ZodTypeAny;
}
  ? z.infer<P>
  : undefined;

export type EndpointResponse<K extends EndpointKey> = z.infer<Endpoints[K]["response"]>;
