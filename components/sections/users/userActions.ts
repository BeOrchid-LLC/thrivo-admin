import { Trash2 } from "lucide-react";
import type { TableRowDetailsFooterOption } from "@/components/general/TableRowDetailsDrawer";
import type { AdminUser } from "@/lib/contracts";

interface UserActionHandlers {
  onDelete?: (user: AdminUser) => void;
}

export function getUserActions(
  user: AdminUser,
  handlers: UserActionHandlers
): TableRowDetailsFooterOption[] {
  const options: TableRowDetailsFooterOption[] = [];

  if (handlers.onDelete) {
    options.push({
      label: "Delete permanently",
      icon: Trash2,
      variant: "destructive",
      onClick: () => handlers.onDelete!(user),
    });
  }

  return options;
}
