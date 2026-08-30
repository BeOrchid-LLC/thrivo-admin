import { ExternalLink, RefreshCw, Trash2, Undo2, XCircle } from "lucide-react";
import type { TableRowDetailsFooterOption } from "@/components/general/TableRowDetailsDrawer";
import type { AdminUser } from "@/lib/contracts";

interface UserActionHandlers {
  onDelete?: (user: AdminUser) => void;
  onCancelSubscription?: (user: AdminUser) => void;
  onRefundSubscription?: (user: AdminUser) => void;
  onReconcileSubscription?: (user: AdminUser) => void;
}

export function getUserActions(
  user: AdminUser,
  handlers: UserActionHandlers,
  { includeViewDetails = true }: { includeViewDetails?: boolean } = {}
): TableRowDetailsFooterOption[] {
  const options: TableRowDetailsFooterOption[] = includeViewDetails
    ? [
        {
          label: "View full details",
          icon: ExternalLink,
          onClick: () => {
            window.location.href = `/users/${user.id}`;
          },
        },
      ]
    : [];

  if (handlers.onDelete) {
    options.push({
      label: "Delete permanently",
      icon: Trash2,
      variant: "destructive",
      onClick: () => handlers.onDelete!(user),
    });
  }

  if (user.subscription && handlers.onCancelSubscription) {
    options.push({
      label: "Cancel subscription",
      icon: XCircle,
      onClick: () => handlers.onCancelSubscription!(user),
    });
  }

  if (user.subscription && handlers.onRefundSubscription) {
    options.push({
      label: "Record refund decision",
      icon: Undo2,
      onClick: () => handlers.onRefundSubscription!(user),
    });
  }

  if (user.subscription && handlers.onReconcileSubscription) {
    options.push({
      label: "Reconcile subscription",
      icon: RefreshCw,
      onClick: () => handlers.onReconcileSubscription!(user),
    });
  }

  return options;
}
