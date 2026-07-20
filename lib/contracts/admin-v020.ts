/**
 * Local v0.20.0 additions — remove once @beorchid-llc/thrivo-contracts@0.20.0
 * is published and installed. These mirror the definitions in
 * thrivo-backend/contracts/src/admin.ts and admin-management.ts exactly.
 */
import { z } from "zod";

// Extended role includes super-admin
export const adminRoleV2Schema = z.enum(["super-admin", "admin", "support", "read-only"]);
export type AdminRoleV2 = z.infer<typeof adminRoleV2Schema>;

export const adminV2Schema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: adminRoleV2Schema,
});
export type AdminV2 = z.infer<typeof adminV2Schema>;

export const sessionV2ResponseSchema = z.object({ admin: adminV2Schema });

// ---- Password auth payloads ----

export const ADMIN_PASSWORD_MIN = 10;

export const adminPasswordLoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(ADMIN_PASSWORD_MIN),
});
export type AdminPasswordLoginPayload = z.infer<typeof adminPasswordLoginPayloadSchema>;

export const adminAcceptInvitePayloadSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(ADMIN_PASSWORD_MIN),
});
export type AdminAcceptInvitePayload = z.infer<typeof adminAcceptInvitePayloadSchema>;

export const adminRequestPasswordResetPayloadSchema = z.object({
  email: z.string().email(),
});
export type AdminRequestPasswordResetPayload = z.infer<
  typeof adminRequestPasswordResetPayloadSchema
>;

export const adminResetPasswordPayloadSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(ADMIN_PASSWORD_MIN),
});
export type AdminResetPasswordPayload = z.infer<typeof adminResetPasswordPayloadSchema>;

export const adminChangePasswordPayloadSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(ADMIN_PASSWORD_MIN),
});
export type AdminChangePasswordPayload = z.infer<typeof adminChangePasswordPayloadSchema>;

// ---- Admin management ----

export const adminAccountStatusSchema = z.enum(["invited", "active", "disabled"]);
export type AdminAccountStatus = z.infer<typeof adminAccountStatusSchema>;

export const adminAccountSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: adminRoleV2Schema,
  status: adminAccountStatusSchema,
  permissions: z.array(z.string()).nullable(),
  invitedByEmail: z.string().email().nullable(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminAccount = z.infer<typeof adminAccountSchema>;

export const adminListResponseSchema = z.object({ items: z.array(adminAccountSchema) });
export type AdminListResponse = z.infer<typeof adminListResponseSchema>;

export const adminAccountResponseSchema = z.object({ admin: adminAccountSchema });
export type AdminAccountResponse = z.infer<typeof adminAccountResponseSchema>;

export const adminInvitePayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  role: adminRoleV2Schema,
});
export type AdminInvitePayload = z.infer<typeof adminInvitePayloadSchema>;

export const adminUpdatePayloadSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    role: adminRoleV2Schema.optional(),
    status: adminAccountStatusSchema.optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });
export type AdminUpdatePayload = z.infer<typeof adminUpdatePayloadSchema>;
