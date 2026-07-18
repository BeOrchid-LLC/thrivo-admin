/**
 * TEMPORARY local mirror of `@beorchid-llc/thrivo-contracts@0.17.1`'s
 * `admin-billing` module (unpublished). See admin-foods.local.ts for the
 * promote/delete plan — same deal: DELETE this and re-export from the package
 * once 0.17.x is published and this app repins.
 */
import { z } from "zod";
import { adminKeysetPaginated, idSchema, isoDateSchema } from "@beorchid-llc/thrivo-contracts";

export const adminSubscriptionEventTypeSchema = z.enum([
  "trial_started",
  "trial_converted",
  "trial_cancelled",
  "renewed",
  "expired",
]);

export const adminSubscriptionEventSchema = z.object({
  id: idSchema,
  userId: idSchema,
  userEmail: z.string().email().nullable(),
  eventType: adminSubscriptionEventTypeSchema,
  productId: z.string().nullable(),
  occurredAt: isoDateSchema,
  priceAmountCents: z.number().int().nullable(),
  currency: z.string().nullable(),
});
export type AdminSubscriptionEvent = z.infer<typeof adminSubscriptionEventSchema>;

export const adminSubscriptionEventListResponseSchema = adminKeysetPaginated(
  adminSubscriptionEventSchema
);

export const adminUserBillingEventsResponseSchema = z.object({
  events: z.array(adminSubscriptionEventSchema),
});

export const adminWebhookProviderSchema = z.enum(["revenuecat", "stripe"]);
export const adminWebhookStatusSchema = z.enum(["received", "processed", "failed"]);

export const adminWebhookEventRowSchema = z.object({
  id: idSchema,
  provider: adminWebhookProviderSchema,
  eventId: z.string(),
  status: adminWebhookStatusSchema,
  receivedAt: isoDateSchema,
  processedAt: isoDateSchema.nullable(),
});
export type AdminWebhookEventRow = z.infer<typeof adminWebhookEventRowSchema>;

export const adminWebhookEventListResponseSchema = adminKeysetPaginated(adminWebhookEventRowSchema);

export const adminWebhookEventDetailSchema = adminWebhookEventRowSchema.extend({
  payload: z.unknown(),
});
export const adminWebhookEventDetailResponseSchema = z.object({
  webhook: adminWebhookEventDetailSchema,
});
export type AdminWebhookEventDetail = z.infer<typeof adminWebhookEventDetailSchema>;

export const adminAckSchema = z.null();
