import { z } from "zod";
import { idSchema, isoDateSchema } from "./common";
import { entitlementSchema, subscriptionStatusSchema } from "./subscription";

/** A user row in the admin user table. */
export const adminUserSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  name: z.string().nullable(),
  entitlement: entitlementSchema,
  status: z.enum(["active", "suspended", "deleted"]),
  createdAt: isoDateSchema,
  lastActiveAt: isoDateSchema.nullable(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

/** Full user detail (profile + activity summary + subscription). */
export const adminUserDetailSchema = adminUserSchema.extend({
  goal: z.string().nullable(),
  targetCalories: z.number().nullable(),
  totalFoodLogs: z.number(),
  currentStreakDays: z.number(),
  subscription: z
    .object({
      status: subscriptionStatusSchema,
      priceLabel: z.string().nullable(),
      renewsAt: isoDateSchema.nullable(),
      cancelAtPeriodEnd: z.boolean(),
    })
    .nullable(),
});
export type AdminUserDetail = z.infer<typeof adminUserDetailSchema>;

export const userDetailResponse = z.object({ user: adminUserDetailSchema });
export type UserDetailResponse = z.infer<typeof userDetailResponse>;

export const refundPayload = z.object({
  amountCents: z.number().int().positive().optional(),
  reason: z.string().min(1),
});
export type RefundPayload = z.infer<typeof refundPayload>;

export const cancelPayload = z.object({ reason: z.string().min(1) });
export type CancelPayload = z.infer<typeof cancelPayload>;

export const exportResponse = z.object({ url: z.string().url() });
export type ExportResponse = z.infer<typeof exportResponse>;
