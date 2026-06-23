import { z } from "zod";
import { idSchema, isoDateSchema } from "@beorchid-llc/thrivo-contracts";

export const TIP_MOODS = ["great", "good", "okay", "low", "bad"] as const;
export type TipMood = (typeof TIP_MOODS)[number];

export const tipSchema = z.object({
  id: idSchema,
  body: z.string(),
  mood: z.enum(TIP_MOODS).nullable(),
  isActive: z.boolean(),
  pinnedDate: isoDateSchema.nullable(),
  updatedAt: isoDateSchema,
});
export type Tip = z.infer<typeof tipSchema>;

export const tipResponse = z.object({ tip: tipSchema });
export type TipResponse = z.infer<typeof tipResponse>;

export const upsertTipPayload = z.object({
  body: z.string().min(1),
  mood: z.enum(TIP_MOODS).nullable().optional(),
  isActive: z.boolean().optional(),
  pinnedDate: z.string().nullable().optional(),
});
export type UpsertTipPayload = z.infer<typeof upsertTipPayload>;
