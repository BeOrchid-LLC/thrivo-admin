"use client";

import { useAdminSession } from "@/components/providers/SessionProvider";
import {
  ADMIN_ROLE_DEFAULT_PERMISSIONS,
  type AdminPermission,
  type AdminRoleV2,
} from "@/lib/contracts";

/**
 * Client-side capability check mirroring the backend's `requireAdminRole`
 * ladder (read-only < support < admin < super-admin). This is UX only — it
 * hides/disables actions a role can't perform so operators don't hit a 403
 * mid-flow. The backend remains the authoritative boundary on every
 * `/admin/*` mutation.
 */
export function useCapability() {
  const { role, permissions } = useAdminSession();
  const effective = new Set(
    permissions ?? ADMIN_ROLE_DEFAULT_PERMISSIONS[role as AdminRoleV2] ?? []
  );
  const can = (permission: AdminPermission) => effective.has(permission);
  return {
    role,
    canManageContent: can("content.manage"),
    canPerformSensitive:
      can("users.manage") || can("subscriptions.manage") || can("billing.manage"),
    canManageAdmins: can("admins.manage"),
    canManageSettings: can("settings.manage"),
    canManagePush: can("push.manage"),
    canManageModeration: can("moderation.manage"),
    canManageFoods: can("foods.manage"),
    canManageUsers: can("users.manage"),
    canReadUsers: can("users.read"),
    canManageSubscriptions: can("subscriptions.manage"),
    canManageBilling: can("billing.manage"),
    canManageLeads: can("leads.manage"),
    canManageErasures: can("erasures.manage"),
  };
}
