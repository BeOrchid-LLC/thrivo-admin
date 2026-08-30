"use client";

import { ActionsMenu } from "@/components/general/ActionsMenu";
import type { AdminUser } from "@/lib/contracts";
import { useCapability } from "@/lib/hooks/useCapability";
import { getUserActions } from "./userActions";

interface UserActionsMenuProps {
  user: AdminUser;
  onDelete?: (user: AdminUser) => void;
  align?: "start" | "end";
  showViewDetails?: boolean;
}

export function UserActionsMenu({
  user,
  onDelete,
  align = "end",
  showViewDetails = true,
}: UserActionsMenuProps) {
  const { canManageUsers } = useCapability();
  // Hard delete is admin-only; support/read-only never see the option (the
  // backend enforces it too — this just avoids offering a 403).
  const options = getUserActions(
    user,
    { onDelete: canManageUsers ? onDelete : undefined },
    { includeViewDetails: showViewDetails }
  );

  if (options.length === 0) return null;

  return <ActionsMenu options={options} align={align} ariaLabel={`Actions for ${user.email}`} />;
}
