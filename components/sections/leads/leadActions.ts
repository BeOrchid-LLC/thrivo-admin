import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TableRowDetailsFooterOption } from "@/components/general/TableRowDetailsDrawer";
import type { Lead } from "@/lib/contracts";

interface LeadActionHandlers {
  onView?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

export function getLeadActions(
  lead: Lead,
  handlers: LeadActionHandlers
): TableRowDetailsFooterOption[] {
  const options: TableRowDetailsFooterOption[] = handlers.onView
    ? [
        {
          label: "View details",
          icon: ExternalLink,
          onClick: () => handlers.onView!(lead),
        },
      ]
    : [];

  options.push({
    label: "Copy email",
    icon: Copy,
    onClick: () => {
      void navigator.clipboard.writeText(lead.email).then(() => toast.success("Email copied"));
    },
  });

  if (handlers.onDelete) {
    options.push({
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: () => handlers.onDelete!(lead),
    });
  }

  return options;
}
