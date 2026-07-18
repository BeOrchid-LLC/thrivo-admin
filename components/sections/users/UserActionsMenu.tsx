"use client";

import { ActionsMenu } from "@/components/general/ActionsMenu";
import type { AdminUser } from "@/lib/contracts";
import { useCapability } from "@/lib/hooks/useCapability";
import { getUserActions } from "./userActions";

interface UserActionsMenuProps {
  user: AdminUser;
  onDelete?: (user: AdminUser) => void;
  align?: "start" | "end";
}

export function UserActionsMenu({ user, onDelete, align = "end" }: UserActionsMenuProps) {
  const { canPerformSensitive } = useCapability();
  // Hard delete is admin-only; support/read-only never see the option (the
  // backend enforces it too — this just avoids offering a 403).
  const options = getUserActions(user, {
    onDelete: canPerformSensitive ? onDelete : undefined,
  });

  return <ActionsMenu options={options} align={align} ariaLabel={`Actions for ${user.email}`} />;
}
