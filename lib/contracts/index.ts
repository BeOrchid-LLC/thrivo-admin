/**
 * Contract barrel for the admin panel.
 *
 * Core auth + admin-user schemas come from the shared `@beorchid-llc/thrivo-contracts`
 * package (the single source of truth for all Thrivo apps). Admin-only schemas
 * that aren't yet promoted (analytics, content, logs, subscriptions) live in
 * adjacent local files and will migrate to the package as their backend
 * endpoints land.
 *
 * Backward-compat aliases preserve the previous local names so callers don't
 * need to be updated all at once.
 */

import { z } from "zod";

// Primary source of truth
export * from "@beorchid-llc/thrivo-contracts";

// v0.5.0 envelope overrides — shadow the package exports until the package is
// published and the dependency is bumped to ^0.5.0, then remove these two exports.
export function successEnvelope<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    success: z.literal(true),
    data,
    responseCode: z.number(),
    message: z.string(),
  });
}

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

// Admin-only schemas not yet promoted to the shared package
export * from "./subscription";
export * from "./analytics";
export * from "./content";
export * from "./logs";
