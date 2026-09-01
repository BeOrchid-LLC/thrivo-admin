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
 *
 * The published 0.24.0 release now contains the admin action, CRM, delivery,
 * moderation, push, and analytics contracts that were previously mirrored
 * locally. Keep only compatibility aliases and UI-only permission metadata in
 * this barrel.
 */

// Primary source of truth for every API contract.
export * from "@beorchid-llc/thrivo-contracts";

import { z } from "zod";
import {
  adminAccountErasureListResponseSchema,
  adminAccountErasureSchema,
  adminAccountListResponseSchema,
  adminAccountSchema,
  adminAuditLogEntrySchema,
  adminDeleteUserPayloadSchema,
  adminEmailLogSchema,
  adminPermissionsSchema,
  adminPermissionSchema,
  adminPaginated,
  adminRoleSchema,
  adminSchema,
  adminSettingsResponseSchema,
  adminSessionResponseSchema,
  adminRetryErasurePayloadSchema,
  updateGlobalSettingsPayloadSchema,
} from "@beorchid-llc/thrivo-contracts";

/** Compatibility aliases retained for the existing endpoint registry. */
export const deleteUserPayload = adminDeleteUserPayloadSchema;

/**
 * The published erasure contract does not yet include the optional user
 * summary returned by the admin list endpoint. Extend that package schema at
 * the response boundary until the next contract release includes those fields.
 */
export const accountErasureSchema = adminAccountErasureSchema.extend({
  userId: z.string().nullable().optional(),
  userEmail: z.string().email().nullable().optional(),
});
export const accountErasureListResponse = adminAccountErasureListResponseSchema.extend({
  erasures: z.array(accountErasureSchema),
});
export const retryAccountErasurePayload = adminRetryErasurePayloadSchema;

/** App auth includes Clerk metadata permissions in addition to the API identity. */
export const adminRoleV2Schema = adminRoleSchema;
export const adminV2Schema = adminSchema.extend({
  permissions: adminPermissionsSchema.optional(),
});
export const sessionV2ResponseSchema = adminSessionResponseSchema;
export const sessionResponse = adminSessionResponseSchema;
export const adminRoleSchemaExtended = adminRoleV2Schema;
export const adminSchemaExtended = adminV2Schema;
export type AdminRoleV2 = import("@beorchid-llc/thrivo-contracts").AdminRole;
export type AdminV2 = z.infer<typeof adminV2Schema>;
export type Admin = AdminV2;

/**
 * Compatibility adapter for the profile contract until the published shared
 * contracts package reaches 0.25.0. The backend source of truth lives in
 * thrivo-backend/contracts/src/admin-profile.ts.
 */
export const adminSelfProfileSchema = adminAccountSchema.extend({
  effectivePermissions: z.array(adminPermissionSchema),
  permissionSource: z.enum(["role", "custom"]),
  authProvider: z.literal("clerk"),
});
export type AdminSelfProfile = z.infer<typeof adminSelfProfileSchema>;
export const adminSelfProfileResponseSchema = z.object({ admin: adminSelfProfileSchema });
export type AdminSelfProfileResponse = z.infer<typeof adminSelfProfileResponseSchema>;
export const adminSelfProfileActivityResponseSchema = adminPaginated(adminAuditLogEntrySchema);
export type AdminSelfProfileActivityResponse = z.infer<
  typeof adminSelfProfileActivityResponseSchema
>;

/** UI-only permission labels/defaults; the permission values come from the package schema. */
export const ADMIN_PERMISSION_OPTIONS: {
  value: import("@beorchid-llc/thrivo-contracts").AdminPermission;
  label: string;
}[] = [
  { value: "users.read", label: "View users" },
  { value: "users.manage", label: "Manage users" },
  { value: "subscriptions.read", label: "View subscriptions" },
  { value: "subscriptions.manage", label: "Manage subscriptions" },
  { value: "billing.read", label: "View billing" },
  { value: "billing.manage", label: "Manage billing" },
  { value: "content.manage", label: "Manage psychology content" },
  { value: "moderation.manage", label: "Manage moderation" },
  { value: "foods.manage", label: "Manage foods" },
  { value: "push.manage", label: "Manage push campaigns" },
  { value: "erasures.manage", label: "Manage account erasures" },
  { value: "leads.manage", label: "Manage leads" },
  { value: "audit.read", label: "View audit log" },
  { value: "analytics.read", label: "View analytics" },
  { value: "admins.manage", label: "Manage admins" },
  { value: "settings.manage", label: "Manage global settings" },
];
export const ADMIN_ROLE_DEFAULT_PERMISSIONS: Record<
  AdminRoleV2,
  readonly import("@beorchid-llc/thrivo-contracts").AdminPermission[]
> = {
  "read-only": ["users.read", "subscriptions.read", "billing.read", "audit.read", "analytics.read"],
  support: [
    "users.read",
    "subscriptions.read",
    "billing.read",
    "audit.read",
    "analytics.read",
    "content.manage",
    "moderation.manage",
    "foods.manage",
    "push.manage",
  ],
  admin: [
    "users.read",
    "users.manage",
    "subscriptions.read",
    "subscriptions.manage",
    "billing.read",
    "billing.manage",
    "content.manage",
    "moderation.manage",
    "foods.manage",
    "push.manage",
    "erasures.manage",
    "leads.manage",
    "audit.read",
    "analytics.read",
    "settings.manage",
  ],
  "super-admin": ADMIN_PERMISSION_OPTIONS.map(({ value }) => value),
};

export const adminListResponseSchema = adminAccountListResponseSchema;
export type AdminListResponse = import("@beorchid-llc/thrivo-contracts").AdminAccountListResponse;
export const adminSettingsSchema = adminSettingsResponseSchema.shape.settings;
export type AdminSettings = z.infer<typeof adminSettingsSchema>;
export const adminSettingsUpdatePayloadSchema = updateGlobalSettingsPayloadSchema;

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
  // admin auth — sessionResponse uses v2 schema (includes super-admin role)
  // adminSessionResponseSchema as sessionResponse, ← replaced by sessionV2ResponseSchema below
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
  adminAuditLogEntrySchema as auditLogEntrySchema,
  type AdminAuditLogEntry as AuditLogEntry,
  // subscriptions
  adminSubscriptionRowSchema as subscriptionRowSchema,
  adminSubscriptionStatusSchema as subscriptionStatusSchema,
  type AdminSubscriptionRow as SubscriptionRow,
  type AdminSubscriptionStatus as SubscriptionStatus,
  // leads (email captures)
} from "@beorchid-llc/thrivo-contracts";

export {
  adminLeadSchema as leadSchema,
  adminLeadListResponseSchema as leadListResponse,
  type AdminLead as Lead,
  type AdminLeadDetail as LeadDetail,
} from "@beorchid-llc/thrivo-contracts";

// Email delivery aliases for the historical admin names.
export {
  adminEmailLogSchema as emailLogSchema,
  type AdminEmailLog as EmailLog,
} from "@beorchid-llc/thrivo-contracts";
export const emailKindSchema = adminEmailLogSchema.shape.kind;
export const emailStatusSchema = adminEmailLogSchema.shape.status;

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
  type AdminPushSegment as PushSegment,
  type AdminCreateCampaignPayload as CreateCampaignPayload,
} from "@beorchid-llc/thrivo-contracts";

export type { AdminPushCampaignRow as PushCampaignRow } from "@beorchid-llc/thrivo-contracts";

// UGC-moderation DTOs (package 0.19.0+).
export {
  adminCheckinNoteRowSchema as checkinNoteRowSchema,
  adminCheckinNoteListResponseSchema as checkinNoteListResponse,
  adminUploadRowSchema as uploadRowSchema,
  adminUploadListResponseSchema as uploadListResponse,
  type AdminCheckinNoteRow as CheckinNoteRow,
  type AdminUploadRow as UploadRow,
} from "@beorchid-llc/thrivo-contracts";
