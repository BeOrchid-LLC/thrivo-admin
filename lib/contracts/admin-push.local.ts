/**
 * TEMPORARY local mirror of `@beorchid-llc/thrivo-contracts@0.18.0`'s
 * `admin-push` module (unpublished). See admin-foods.local.ts — same
 * promote/delete plan once 0.18.x is published and this app repins.
 */
import { z } from "zod";
import { adminKeysetPaginated, idSchema, isoDateSchema } from "@beorchid-llc/thrivo-contracts";

export const adminPushSegmentSchema = z
  .object({
    all: z.boolean().optional(),
    tier: z.enum(["free", "premium"]).optional(),
    subscriptionStatus: z.enum(["active", "trialing", "canceled", "expired", "none"]).optional(),
    lastActiveWithinDays: z.number().int().positive().max(365).optional(),
  })
  .refine(
    (s) =>
      s.all === true ||
      s.tier !== undefined ||
      s.subscriptionStatus !== undefined ||
      s.lastActiveWithinDays !== undefined,
    { message: "Segment must target `all` or at least one filter" }
  );
export type AdminPushSegment = z.infer<typeof adminPushSegmentSchema>;

export const adminPushCampaignStatusSchema = z.enum([
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
]);

export const adminPushCampaignRowSchema = z.object({
  id: idSchema,
  title: z.string(),
  body: z.string(),
  deepLink: z.string().nullable(),
  status: adminPushCampaignStatusSchema,
  segment: adminPushSegmentSchema,
  scheduledAt: isoDateSchema.nullable(),
  recipientCount: z.number().int(),
  sentCount: z.number().int(),
  failedCount: z.number().int(),
  sentAt: isoDateSchema.nullable(),
  createdByAdminEmail: z.string(),
  createdAt: isoDateSchema,
});
export type AdminPushCampaignRow = z.infer<typeof adminPushCampaignRowSchema>;

export const adminPushCampaignListResponseSchema = adminKeysetPaginated(adminPushCampaignRowSchema);
export const adminPushCampaignDetailResponseSchema = z.object({
  campaign: adminPushCampaignRowSchema,
});

export const adminCreateCampaignPayloadSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  deepLink: z.string().max(500).optional(),
  segment: adminPushSegmentSchema,
  scheduledAt: z.string().datetime().optional(),
});
export type AdminCreateCampaignPayload = z.infer<typeof adminCreateCampaignPayloadSchema>;

export const adminAudienceEstimatePayloadSchema = z.object({ segment: adminPushSegmentSchema });
export const adminAudienceEstimateResponseSchema = z.object({
  userCount: z.number().int(),
  tokenCount: z.number().int(),
});
