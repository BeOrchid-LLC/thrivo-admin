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

// Primary source of truth
export * from "@beorchid-llc/thrivo-contracts";

// Backward-compatibility aliases (old local name → package export)
export {
  // error envelope — R6 I17: apiErrorSchema.error.code is now the discriminated
  // enum (errorCodeSchema) upstream, so this is a straight re-export, not a
  // separately-loosened copy.
  apiErrorSchema as errorEnvelope,
  type ApiError as ErrorEnvelope,
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
  // pagination — offset (still the shape for subscriptions/tips/email-logs/audit-log)
  adminPaginated as paginated,
  adminPaginationSchema as paginationMetaSchema,
  type AdminPagination as PaginationMeta,
  // pagination — keyset (R5-4: users, leads)
  adminKeysetPaginated as keysetPaginated,
  adminKeysetPaginationSchema as keysetPaginationMetaSchema,
  type AdminKeysetPagination as KeysetPaginationMeta,
  adminUserListResponseSchema as userListResponse,
  type AdminUserListResponse as UserListResponse,
  adminUserTimelineResponseSchema as userTimelineResponse,
  type AdminUserTimelineResponse as UserTimelineResponse,
  adminUserActivityResponseSchema as userActivityResponse,
  type AdminUserActivityResponse as UserActivityResponse,
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
  // overview
  adminOverviewMetricsResponseSchema as overviewMetricsResponse,
  type AdminOverviewMetricsResponse as OverviewMetricsResponse,
  adminOverviewRevenueTrendResponseSchema as overviewRevenueTrendResponse,
  type AdminOverviewRevenueTrendResponse as OverviewRevenueTrendResponse,
  adminOverviewTrialPipelineResponseSchema as overviewTrialPipelineResponse,
  type AdminOverviewTrialPipelineResponse as OverviewTrialPipelineResponse,
  adminOverviewPlanBreakdownResponseSchema as overviewPlanBreakdownResponse,
  type AdminOverviewPlanBreakdownResponse as OverviewPlanBreakdownResponse,
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
  // leads (email captures)
  adminLeadSchema as leadSchema,
  adminLeadListResponseSchema as leadListResponse,
  type AdminLead as Lead,
  type AdminLeadListResponse as LeadListResponse,
} from "@beorchid-llc/thrivo-contracts";

// Food-moderation DTOs (package 0.17.0+).
export {
  adminFoodItemRowSchema as foodItemRowSchema,
  adminFoodItemDetailSchema as foodItemDetailSchema,
  adminFoodListResponseSchema as foodListResponse,
  adminFoodDetailResponseSchema as foodDetailResponse,
  adminFoodStatusSchema as foodStatusSchema,
  adminFoodTierSchema as foodTierSchema,
  adminFoodEditPayloadSchema as foodEditPayload,
  adminFoodRejectPayloadSchema as foodRejectPayload,
  adminFoodMergePayloadSchema as foodMergePayload,
  type AdminFoodItemRow as FoodItemRow,
  type AdminFoodItemDetail as FoodItemDetail,
  type AdminFoodEditPayload as FoodEditPayload,
  type AdminFoodRejectPayload as FoodRejectPayload,
  type AdminFoodMergePayload as FoodMergePayload,
} from "@beorchid-llc/thrivo-contracts";

// Billing-observability DTOs (package 0.17.1+).
export {
  adminSubscriptionEventSchema as subscriptionEventSchema,
  adminSubscriptionEventListResponseSchema as subscriptionEventListResponse,
  adminUserBillingEventsResponseSchema as userBillingEventsResponse,
  adminWebhookEventRowSchema as webhookEventRowSchema,
  adminWebhookEventListResponseSchema as webhookEventListResponse,
  adminWebhookEventDetailResponseSchema as webhookEventDetailResponse,
  type AdminSubscriptionEvent as SubscriptionEvent,
  type AdminWebhookEventRow as WebhookEventRow,
} from "@beorchid-llc/thrivo-contracts";

// The package exposes the webhook detail via its response wrapper; derive the
// row type from it (it doesn't export a standalone `AdminWebhookEventDetail`).
export type WebhookEventDetail =
  import("@beorchid-llc/thrivo-contracts").AdminWebhookEventDetailResponse["webhook"];

// Push-campaign DTOs (package 0.18.0+).
export {
  adminPushCampaignRowSchema as pushCampaignRowSchema,
  adminPushCampaignListResponseSchema as pushCampaignListResponse,
  adminPushCampaignDetailResponseSchema as pushCampaignDetailResponse,
  adminPushSegmentSchema as pushSegmentSchema,
  adminCreateCampaignPayloadSchema as createCampaignPayload,
  adminAudienceEstimatePayloadSchema as audienceEstimatePayload,
  adminAudienceEstimateResponseSchema as audienceEstimateResponse,
  type AdminPushCampaignRow as PushCampaignRow,
  type AdminPushSegment as PushSegment,
  type AdminCreateCampaignPayload as CreateCampaignPayload,
} from "@beorchid-llc/thrivo-contracts";

// UGC-moderation DTOs (package 0.19.0+).
export {
  adminCheckinNoteRowSchema as checkinNoteRowSchema,
  adminCheckinNoteListResponseSchema as checkinNoteListResponse,
  adminUploadRowSchema as uploadRowSchema,
  adminUploadListResponseSchema as uploadListResponse,
  type AdminCheckinNoteRow as CheckinNoteRow,
  type AdminUploadRow as UploadRow,
} from "@beorchid-llc/thrivo-contracts";
