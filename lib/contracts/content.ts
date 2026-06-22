import { z } from "zod";
import { idSchema, isoDateSchema } from "@beorchid-llc/thrivo-contracts";

export const tipSchema = z.object({
  id: idSchema,
  body: z.string(),
  mood: z.string().nullable(),
  isActive: z.boolean(),
  pinnedDate: isoDateSchema.nullable(),
  updatedAt: isoDateSchema,
});
export type Tip = z.infer<typeof tipSchema>;

export const tipResponse = z.object({ tip: tipSchema });
export type TipResponse = z.infer<typeof tipResponse>;

export const upsertTipPayload = z.object({
  body: z.string().min(1),
  mood: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  pinnedDate: z.string().nullable().optional(),
});
export type UpsertTipPayload = z.infer<typeof upsertTipPayload>;
