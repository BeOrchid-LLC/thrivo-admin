"use client";

import { ActionsMenu } from "@/components/general/ActionsMenu";
import type { Lead } from "@/lib/contracts";
import { useCapability } from "@/lib/hooks/useCapability";
import { getLeadActions } from "./leadActions";

interface LeadActionsMenuProps {
  lead: Lead;
  onView?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  align?: "start" | "end";
}

export function LeadActionsMenu({ lead, onView, onDelete, align = "end" }: LeadActionsMenuProps) {
  const { canManageLeads } = useCapability();
  const options = getLeadActions(lead, {
    onView,
    onDelete: canManageLeads ? onDelete : undefined,
  });

  return <ActionsMenu options={options} align={align} ariaLabel={`Actions for ${lead.email}`} />;
}
