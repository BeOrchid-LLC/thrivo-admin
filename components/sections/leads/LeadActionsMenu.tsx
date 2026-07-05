"use client";

import { ActionsMenu } from "@/components/general/ActionsMenu";
import type { Lead } from "@/lib/contracts";
import { getLeadActions } from "./leadActions";

interface LeadActionsMenuProps {
  lead: Lead;
  onDelete?: (lead: Lead) => void;
  align?: "start" | "end";
}

export function LeadActionsMenu({ lead, onDelete, align = "end" }: LeadActionsMenuProps) {
  const options = getLeadActions(lead, { onDelete });

  return <ActionsMenu options={options} align={align} ariaLabel={`Actions for ${lead.email}`} />;
}
