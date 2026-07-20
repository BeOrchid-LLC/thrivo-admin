import { ExternalLink } from "lucide-react";
import type { TableRowDetailsFooterOption } from "@/components/general/TableRowDetailsDrawer";

/** Returns a "View full details" action that navigates to the entity's detail page. */
export function getViewAction(href: string): TableRowDetailsFooterOption {
  return {
    label: "View full details",
    icon: ExternalLink,
    onClick: () => {
      window.location.href = href;
    },
  };
}
