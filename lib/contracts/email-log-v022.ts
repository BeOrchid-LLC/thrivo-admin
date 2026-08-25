import { z } from "zod";

export const emailKindSchema = z.enum([
  "welcome",
  "weekly_review",
  "trial_ending",
  "cancellation_confirmation",
  "admin_otp",
  "admin_invite",
  "admin_password_reset",
  "legacy_notification",
]);
export const emailStatusSchema = z.enum([
  "queued",
  "processing",
  "retrying",
  "sent",
  "delivered",
  "bounced",
  "complained",
  "suppressed",
  "failed",
  "expired",
]);
export const emailLogV2Schema = z.object({
  id: z.string(),
  to: z.string().email(),
  template: z.string(),
  kind: emailKindSchema,
  status: emailStatusSchema,
  attempts: z.number().int().nonnegative(),
  providerMessageId: z.string().nullable(),
  sentAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  failedAt: z.string().nullable(),
  failureCode: z.string().nullable(),
  error: z.string().nullable(),
  createdAt: z.string(),
});
export type EmailLogV2 = z.infer<typeof emailLogV2Schema>;
