/**
 * TEMPORARY local mirror of `@beorchid-llc/thrivo-contracts@0.17.0`'s
 * `admin-foods` module. The package bump that carries these schemas
 * (0.16.1 -> 0.17.0) is not yet published, so the admin foods-moderation UI
 * imports them from here in the meantime.
 *
 * TODO(promote): once 0.17.0 is published and this app repins to ^0.17.0,
 * DELETE this file and re-export the package's admin-foods schemas from
 * lib/contracts/index.ts instead (same pattern R6 used to retire the earlier
 * local admin DTOs). Keep this in exact sync with
 * thrivo-backend/contracts/src/admin-foods.ts until then.
 */
import { z } from "zod";
import { adminKeysetPaginated, idSchema, isoDateSchema } from "@beorchid-llc/thrivo-contracts";

export const adminFoodTierSchema = z.enum(["authoritative", "community", "personal"]);
export type AdminFoodTier = z.infer<typeof adminFoodTierSchema>;

export const adminFoodStatusSchema = z.enum(["active", "pending", "rejected", "merged"]);
export type AdminFoodStatus = z.infer<typeof adminFoodStatusSchema>;

export const adminFoodOriginSchema = z.enum(["usda", "openfoodfacts", "community", "personal"]);
export type AdminFoodOrigin = z.infer<typeof adminFoodOriginSchema>;

export const adminFoodItemRowSchema = z.object({
  id: idSchema,
  name: z.string(),
  brand: z.string().nullable(),
  tier: adminFoodTierSchema,
  status: adminFoodStatusSchema,
  origin: adminFoodOriginSchema,
  barcode: z.string().nullable(),
  createdBy: idSchema.nullable(),
  verifiedAt: isoDateSchema.nullable(),
  logCount: z.number().int(),
  createdAt: isoDateSchema,
});
export type AdminFoodItemRow = z.infer<typeof adminFoodItemRowSchema>;

export const adminFoodNutrientsSchema = z.object({
  basis: z.enum(["per_100g", "per_100ml", "per_serving"]),
  servingLabel: z.string().nullable(),
  servingG: z.number().nullable(),
  kcal: z.number(),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  fiberG: z.number().nullable(),
  sugarG: z.number().nullable(),
  sodiumMg: z.number().nullable(),
  satFatG: z.number().nullable(),
  novaGroup: z.number().int().nullable(),
});
export type AdminFoodNutrients = z.infer<typeof adminFoodNutrientsSchema>;

export const adminFoodServingSchema = z.object({
  id: idSchema,
  label: z.string(),
  grams: z.number(),
  isDefault: z.boolean(),
});
export type AdminFoodServing = z.infer<typeof adminFoodServingSchema>;

export const adminFoodItemDetailSchema = adminFoodItemRowSchema.extend({
  ownerUserId: idSchema.nullable(),
  mergedIntoId: idSchema.nullable(),
  nutrients: adminFoodNutrientsSchema.nullable(),
  servings: z.array(adminFoodServingSchema),
});
export type AdminFoodItemDetail = z.infer<typeof adminFoodItemDetailSchema>;

export const adminFoodListResponseSchema = adminKeysetPaginated(adminFoodItemRowSchema);
export type AdminFoodListResponse = z.infer<typeof adminFoodListResponseSchema>;

export const adminFoodDetailResponseSchema = z.object({ food: adminFoodItemDetailSchema });
export type AdminFoodDetailResponse = z.infer<typeof adminFoodDetailResponseSchema>;

export const adminFoodEditPayloadSchema = z.object({
  name: z.string().min(1).optional(),
  brand: z.string().nullable().optional(),
  nutrients: z
    .object({
      kcal: z.number().nonnegative(),
      proteinG: z.number().nonnegative(),
      carbsG: z.number().nonnegative(),
      fatG: z.number().nonnegative(),
    })
    .partial()
    .optional(),
});
export type AdminFoodEditPayload = z.infer<typeof adminFoodEditPayloadSchema>;

export const adminFoodRejectPayloadSchema = z.object({ reason: z.string().min(1) });
export type AdminFoodRejectPayload = z.infer<typeof adminFoodRejectPayloadSchema>;

export const adminFoodMergePayloadSchema = z.object({
  mergeIntoId: idSchema,
  reason: z.string().min(1).optional(),
});
export type AdminFoodMergePayload = z.infer<typeof adminFoodMergePayloadSchema>;
