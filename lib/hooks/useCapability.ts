"use client";

import { useAdminSession } from "@/components/providers/SessionProvider";
import type { AdminRoleV2 } from "@/lib/contracts";

/**
 * Client-side capability check mirroring the backend's `requireAdminRole`
 * ladder (read-only < support < admin < super-admin). This is UX only — it
 * hides/disables actions a role can't perform so operators don't hit a 403
 * mid-flow. The backend remains the authoritative boundary on every
 * `/admin/*` mutation.
 */
const RANK: Record<AdminRoleV2, number> = {
  "read-only": 0,
  support: 1,
  admin: 2,
  "super-admin": 3,
};

export function useCapability() {
  const { role } = useAdminSession();
  const rank = RANK[role as AdminRoleV2] ?? 0;
  return {
    role,
    /** Content management (tips CRUD, moderation): support and admin. */
    canManageContent: rank >= RANK.support,
    /** Destructive or money-adjacent actions (hard delete, cancel, refund): admin only. */
    canPerformSensitive: rank >= RANK.admin,
    /** Admin account management (invite, edit role, disable): super-admin only. */
    canManageAdmins: rank >= RANK["super-admin"],
  };
}
