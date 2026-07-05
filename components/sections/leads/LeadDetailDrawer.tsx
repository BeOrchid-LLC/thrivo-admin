"use client";

import type { ReactNode } from "react";
import { DetailsDrawer } from "@/components/general/DetailsDrawer";
import { TableRowDetailsFooter } from "@/components/general/TableRowDetailsDrawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Lead } from "@/lib/contracts";
import { LeadActionsMenu } from "./LeadActionsMenu";

interface LeadDetailDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onDelete: (lead: Lead) => void;
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function LeadDetailDrawer({ lead, onClose, onDelete }: LeadDetailDrawerProps) {
  return (
    <DetailsDrawer
      open={lead !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={lead?.email ?? "Lead"}
      description={lead ? `Captured ${formatDate(lead.capturedAt)}` : undefined}
      metadata={lead ?? undefined}
      dataName="lead"
      footer={({ onViewMetadata }) =>
        lead ? (
          <TableRowDetailsFooter
            actionsMenu={<LeadActionsMenu lead={lead} onDelete={onDelete} align="start" />}
            hasMetadata={lead !== undefined}
            onViewMetadata={onViewMetadata}
          />
        ) : null
      }
    >
      {lead ? (
        <Card>
          <CardHeader>
            <CardTitle>Lead details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Source" value={lead.source ?? "—"} />
            <Row label="Country" value={lead.country ?? "—"} />
            <Row label="Device" value={lead.deviceType ?? "—"} />
            <Row
              label="OS"
              value={[lead.osName, lead.osVersion].filter(Boolean).join(" ") || "—"}
            />
            <Row
              label="Browser"
              value={[lead.browserName, lead.browserVersion].filter(Boolean).join(" ") || "—"}
            />
            <Row label="Referrer" value={lead.referrer ?? "—"} />
            <Row label="UTM source" value={lead.utmSource ?? "—"} />
            <Row label="UTM medium" value={lead.utmMedium ?? "—"} />
            <Row label="UTM campaign" value={lead.utmCampaign ?? "—"} />
            <Row label="Submissions" value={lead.submissionCount} />
            <Row label="First captured" value={formatDate(lead.capturedAt)} />
            <Row label="Last submitted" value={formatDate(lead.lastSubmittedAt)} />
          </CardContent>
        </Card>
      ) : null}
    </DetailsDrawer>
  );
}
