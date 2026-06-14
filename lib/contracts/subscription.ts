import { z } from "zod";
import { idSchema, isoDateSchema } from "./common";

export const entitlementSchema = z.enum(["free", "premium"]);
export type Entitlement = z.infer<typeof entitlementSchema>;

export const subscriptionStatusSchema = z.enum([
  "active",
  "trialing",
  "canceled",
  "expired",
  "none",
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

/** A subscription row as shown in the subscriptions table. */
export const subscriptionRowSchema = z.object({
  id: idSchema,
  userId: idSchema,
  userEmail: z.string().email(),
  entitlement: entitlementSchema,
  status: subscriptionStatusSchema,
  priceLabel: z.string().nullable(),
  /** Which in-app trigger drove the upgrade (history limit / streak / macros). */
  upgradeTrigger: z.string().nullable(),
  startedAt: isoDateSchema.nullable(),
  renewsAt: isoDateSchema.nullable(),
});
export type SubscriptionRow = z.infer<typeof subscriptionRowSchema>;
