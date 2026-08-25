/**
 * Local admin additions — remove once the corresponding shared contract package
 * release is published and installed.
 * is published and installed. These mirror the definitions in
 * thrivo-backend/contracts/src/admin.ts and admin-management.ts exactly.
 */
import { z } from "zod";

// Extended role includes super-admin
export const adminRoleV2Schema = z.enum(["super-admin", "admin", "support", "read-only"]);
export type AdminRoleV2 = z.infer<typeof adminRoleV2Schema>;

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

export const adminAccountStatusSchema = z.enum(["invited", "active", "disabled", "revoked"]);
export type AdminAccountStatus = z.infer<typeof adminAccountStatusSchema>;

export const adminPermissionSchema = z.enum([
  "users.read",
  "users.manage",
  "subscriptions.read",
  "subscriptions.manage",
  "billing.read",
  "billing.manage",
  "content.manage",
  "moderation.manage",
  "foods.manage",
  "push.manage",
  "erasures.manage",
  "leads.manage",
  "audit.read",
  "analytics.read",
  "admins.manage",
  "settings.manage",
]);
export type AdminPermission = z.infer<typeof adminPermissionSchema>;

export const adminV2Schema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: adminRoleV2Schema,
  permissions: z.array(adminPermissionSchema).nullable().optional(),
});
export type AdminV2 = z.infer<typeof adminV2Schema>;

export const sessionV2ResponseSchema = z.object({ admin: adminV2Schema });

export const ADMIN_PERMISSION_OPTIONS: { value: AdminPermission; label: string }[] = [
  { value: "users.read", label: "View users" },
  { value: "users.manage", label: "Manage users" },
  { value: "subscriptions.read", label: "View subscriptions" },
  { value: "subscriptions.manage", label: "Manage subscriptions" },
  { value: "billing.read", label: "View billing" },
  { value: "billing.manage", label: "Manage billing" },
  { value: "content.manage", label: "Manage psychology content" },
  { value: "moderation.manage", label: "Manage moderation" },
  { value: "foods.manage", label: "Manage foods" },
  { value: "push.manage", label: "Manage push campaigns" },
  { value: "erasures.manage", label: "Manage account erasures" },
  { value: "leads.manage", label: "Manage leads" },
  { value: "audit.read", label: "View audit log" },
  { value: "analytics.read", label: "View analytics" },
  { value: "admins.manage", label: "Manage admins" },
  { value: "settings.manage", label: "Manage global settings" },
];

export const ADMIN_ROLE_DEFAULT_PERMISSIONS: Record<AdminRoleV2, readonly AdminPermission[]> = {
  "read-only": ["users.read", "subscriptions.read", "billing.read", "audit.read", "analytics.read"],
  support: [
    "users.read",
    "subscriptions.read",
    "billing.read",
    "audit.read",
    "analytics.read",
    "content.manage",
    "moderation.manage",
    "foods.manage",
    "push.manage",
  ],
  admin: [
    "users.read",
    "users.manage",
    "subscriptions.read",
    "subscriptions.manage",
    "billing.read",
    "billing.manage",
    "content.manage",
    "moderation.manage",
    "foods.manage",
    "push.manage",
    "erasures.manage",
    "leads.manage",
    "audit.read",
    "analytics.read",
    "settings.manage",
  ],
  "super-admin": ADMIN_PERMISSION_OPTIONS.map(({ value }) => value),
};

export const adminAccountSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: adminRoleV2Schema,
  status: adminAccountStatusSchema,
  permissions: z.array(adminPermissionSchema).nullable(),
  invitedByEmail: z.string().email().nullable(),
  lastLoginAt: z.string().nullable(),
  inviteExpiresAt: z.string().nullable(),
  inviteRevokedAt: z.string().nullable(),
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
    permissions: z.array(adminPermissionSchema).nullable().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });
export type AdminUpdatePayload = z.infer<typeof adminUpdatePayloadSchema>;

export const adminSettingsSchema = z.object({
  key: z.literal("default"),
  pushNotificationsEnabled: z.boolean(),
  dailyFoodLogReminderEnabled: z.boolean(),
  psychologyTipPushEnabled: z.boolean(),
  emailFoodLogReminderEnabled: z.boolean(),
  weeklyReviewEmailEnabled: z.boolean(),
  weightCheckReminderEnabled: z.boolean(),
  hydrationReminderEnabled: z.boolean(),
  subscriptionsEnabled: z.boolean(),
  trialsEnabled: z.boolean(),
  purchasesEnabled: z.boolean(),
  cancellationsEnabled: z.boolean(),
  trialDays: z.number().int().min(1).max(90),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminSettings = z.infer<typeof adminSettingsSchema>;
export const adminSettingsResponseSchema = z.object({ settings: adminSettingsSchema });
export const adminSettingsUpdatePayloadSchema = z
  .object({
    pushNotificationsEnabled: z.boolean().optional(),
    dailyFoodLogReminderEnabled: z.boolean().optional(),
    psychologyTipPushEnabled: z.boolean().optional(),
    emailFoodLogReminderEnabled: z.boolean().optional(),
    weeklyReviewEmailEnabled: z.boolean().optional(),
    weightCheckReminderEnabled: z.boolean().optional(),
    hydrationReminderEnabled: z.boolean().optional(),
    subscriptionsEnabled: z.boolean().optional(),
    trialsEnabled: z.boolean().optional(),
    purchasesEnabled: z.boolean().optional(),
    cancellationsEnabled: z.boolean().optional(),
    trialDays: z.number().int().min(1).max(90).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.emailFoodLogReminderEnabled !== undefined &&
      value.weeklyReviewEmailEnabled !== undefined &&
      value.emailFoodLogReminderEnabled !== value.weeklyReviewEmailEnabled
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email reminder controls must match",
      });
    }
  });
