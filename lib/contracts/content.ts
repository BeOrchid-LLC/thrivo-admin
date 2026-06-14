import { z } from "zod";
import { idSchema, isoDateSchema } from "./common";

export const moodSchema = z.enum(["great", "good", "okay", "low", "bad"]);
export type Mood = z.infer<typeof moodSchema>;

/** A psychology "Thrivo Tip" in the managed tip bank (never "coach"). */
export const tipSchema = z.object({
  id: idSchema,
  body: z.string(),
  /** Mood this tip is appropriate for, or null for any. */
  mood: moodSchema.nullable(),
  isActive: z.boolean(),
  /** Pinned to a specific date (YYYY-MM-DD), or null for normal rotation. */
  pinnedDate: z.string().nullable(),
  updatedAt: isoDateSchema,
});
export type Tip = z.infer<typeof tipSchema>;

export const upsertTipPayload = z.object({
  body: z.string().min(1).max(500),
  mood: moodSchema.nullable().optional(),
  isActive: z.boolean().default(true),
  pinnedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});
export type UpsertTipPayload = z.infer<typeof upsertTipPayload>;

export const tipResponse = z.object({ tip: tipSchema });
export type TipResponse = z.infer<typeof tipResponse>;
