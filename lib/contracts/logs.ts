import { z } from "zod";
import { idSchema, isoDateSchema } from "./common";

export const emailStatusSchema = z.enum(["queued", "sent", "failed", "bounced"]);
export type EmailStatus = z.infer<typeof emailStatusSchema>;

export const emailLogSchema = z.object({
  id: idSchema,
  to: z.string().email(),
  template: z.string(),
  status: emailStatusSchema,
  error: z.string().nullable(),
  createdAt: isoDateSchema,
});
export type EmailLog = z.infer<typeof emailLogSchema>;

/** An admin_audit_log entry: who did what, to whom, when. */
export const auditLogEntrySchema = z.object({
  id: idSchema,
  actorEmail: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string().nullable(),
  requestId: z.string().nullable(),
  createdAt: isoDateSchema,
});
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
