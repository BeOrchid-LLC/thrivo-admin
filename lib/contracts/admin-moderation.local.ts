/**
 * TEMPORARY local mirror of `@beorchid-llc/thrivo-contracts@0.19.0`'s
 * `admin-moderation` module (unpublished). See admin-foods.local.ts — same
 * promote/delete plan once 0.19.x is published and this app repins.
 */
import { z } from "zod";
import { adminKeysetPaginated, idSchema, isoDateSchema } from "@beorchid-llc/thrivo-contracts";

export const adminCheckinNoteRowSchema = z.object({
  id: idSchema,
  userId: idSchema,
  userEmail: z.string().email().nullable(),
  note: z.string(),
  localDate: z.string(),
  hiddenAt: isoDateSchema.nullable(),
  createdAt: isoDateSchema,
});
export type AdminCheckinNoteRow = z.infer<typeof adminCheckinNoteRowSchema>;

export const adminCheckinNoteListResponseSchema = adminKeysetPaginated(adminCheckinNoteRowSchema);

export const adminUploadRowSchema = z.object({
  id: idSchema,
  userId: idSchema,
  userEmail: z.string().email().nullable(),
  intent: z.string(),
  publicUrl: z.string(),
  status: z.enum(["pending", "uploaded", "verified", "failed", "expired"]),
  createdAt: isoDateSchema,
});
export type AdminUploadRow = z.infer<typeof adminUploadRowSchema>;

export const adminUploadListResponseSchema = adminKeysetPaginated(adminUploadRowSchema);

export const adminModeratePayloadSchema = z.object({ reason: z.string().max(500).optional() });
