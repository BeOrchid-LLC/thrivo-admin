"use client";

import { ActionsMenu } from "@/components/general/ActionsMenu";
import type { AdminUser } from "@/lib/contracts";
import { getUserActions } from "./userActions";

interface UserActionsMenuProps {
  user: AdminUser;
  onDelete?: (user: AdminUser) => void;
  align?: "start" | "end";
}

export function UserActionsMenu({ user, onDelete, align = "end" }: UserActionsMenuProps) {
  const options = getUserActions(user, { onDelete });

  return <ActionsMenu options={options} align={align} ariaLabel={`Actions for ${user.email}`} />;
}
