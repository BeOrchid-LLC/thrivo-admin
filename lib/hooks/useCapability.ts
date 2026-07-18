"use client";

import { useAdminSession } from "@/components/providers/SessionProvider";
import type { Admin } from "@/lib/contracts";

type AdminRole = Admin["role"];

/**
 * Client-side capability check mirroring the backend's `requireAdminRole`
 * ladder (read-only < support < admin). This is UX only — it hides/disables
 * actions a role can't perform so operators don't hit a 403 mid-flow. The
 * backend remains the authoritative boundary on every `/admin/*` mutation.
 */
const RANK: Record<AdminRole, number> = { "read-only": 0, support: 1, admin: 2 };

export function useCapability() {
  const { role } = useAdminSession();
  const rank = RANK[role] ?? 0;
  return {
    role,
    /** Content management (tips CRUD, moderation): support and admin. */
    canManageContent: rank >= RANK.support,
    /** Destructive or money-adjacent actions (hard delete, cancel, refund): admin only. */
    canPerformSensitive: rank >= RANK.admin,
  };
}
