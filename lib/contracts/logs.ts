import { z } from "zod";
import { idSchema, isoDateSchema } from "@beorchid-llc/thrivo-contracts";

export const emailLogSchema = z.object({
  id: idSchema,
  to: z.string().email(),
  template: z.string(),
  status: z.enum(["queued", "sent", "failed", "bounced"]),
  error: z.string().nullable(),
  createdAt: isoDateSchema,
});
export type EmailLog = z.infer<typeof emailLogSchema>;

export const auditLogEntrySchema = z.object({
  id: idSchema,
  actorEmail: z.string().email(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string().nullable(),
  requestId: z.string().nullable(),
  createdAt: isoDateSchema,
});
export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;
