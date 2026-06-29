/**
 * Contract barrel for the admin panel.
 *
 * All schemas come from the shared `@beorchid-llc/thrivo-contracts` package (the
 * single source of truth for all Thrivo apps). As of 0.7.0 the admin-only DTOs
 * (analytics, content, logs, subscriptions) are promoted into the package; the
 * previously-local files are gone.
 *
 * Backward-compat aliases map the package's `admin`-prefixed export names back to
 * the historical local names so call sites stay unchanged.
 */

import { z } from "zod";

// Primary source of truth
export * from "@beorchid-llc/thrivo-contracts";

// Looser local error envelope — code is z.string() (not the discriminated enum)
// so callers don't break if the backend adds a new code before contracts bumps.
export const errorEnvelope = z.object({
  success: z.literal(false),
  error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }),
  responseCode: z.number(),
  message: z.string(),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelope>;

// Backward-compatibility aliases (old local name → package export)
export {
  // common utilities
  idSchema,
  isoDateSchema,
  timePointSchema,
  type TimePoint,
  // admin auth
  adminSessionResponseSchema as sessionResponse,
  adminAckSchema as ackSchema,
  type AdminAck as Ack,
  adminOtpRequestPayloadSchema as requestOtpPayload,
  type AdminOtpRequestPayload as RequestOtpPayload,
  adminOtpVerifyPayloadSchema as verifyOtpPayload,
  type AdminOtpVerifyPayload as VerifyOtpPayload,
  // admin users
  adminUserDetailResponseSchema as userDetailResponse,
  type AdminUserDetailResponse as UserDetailResponse,
  adminCancelPayloadSchema as cancelPayload,
  type AdminCancelPayload as CancelPayload,
  adminRefundPayloadSchema as refundPayload,
  type AdminRefundPayload as RefundPayload,
  adminExportResponseSchema as exportResponse,
  type AdminExportResponse as ExportResponse,
  // pagination
  adminPaginated as paginated,
  adminPaginationSchema as paginationMetaSchema,
  type AdminPagination as PaginationMeta,
} from "@beorchid-llc/thrivo-contracts";

// Admin DTOs promoted into the package at 0.7.0 — aliased back to the historical
// local names. `entitlementSchema`/`Entitlement` already flow from the wildcard
// re-export above (shared subscription contracts), so they're not re-aliased here.
export {
  // analytics
  adminDashboardMetricsSchema as dashboardMetricsSchema,
  adminDashboardMetricsResponseSchema as dashboardMetricsResponse,
  adminSubscriptionAnalyticsSchema as subscriptionAnalyticsSchema,
  adminSubscriptionAnalyticsResponseSchema as subscriptionAnalyticsResponse,
  adminEngagementAnalyticsSchema as engagementAnalyticsSchema,
  adminEngagementAnalyticsResponseSchema as engagementAnalyticsResponse,
  type AdminDashboardMetrics as DashboardMetrics,
  type AdminSubscriptionAnalytics as SubscriptionAnalytics,
  type AdminEngagementAnalytics as EngagementAnalytics,
  // content (tips)
  adminTipSchema as tipSchema,
  adminTipResponseSchema as tipResponse,
  adminUpsertTipPayloadSchema as upsertTipPayload,
  ADMIN_TIP_MOODS as TIP_MOODS,
  type AdminTip as Tip,
  type AdminTipResponse as TipResponse,
  type AdminUpsertTipPayload as UpsertTipPayload,
  type AdminTipMood as TipMood,
  // logs
  adminEmailLogSchema as emailLogSchema,
  adminAuditLogEntrySchema as auditLogEntrySchema,
  type AdminEmailLog as EmailLog,
  type AdminAuditLogEntry as AuditLogEntry,
  // subscriptions
  adminSubscriptionRowSchema as subscriptionRowSchema,
  adminSubscriptionStatusSchema as subscriptionStatusSchema,
  type AdminSubscriptionRow as SubscriptionRow,
  type AdminSubscriptionStatus as SubscriptionStatus,
} from "@beorchid-llc/thrivo-contracts";
