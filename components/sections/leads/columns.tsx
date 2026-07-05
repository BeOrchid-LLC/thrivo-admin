"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Lead } from "@/lib/contracts";
import { TruncatedCell } from "@/components/general/TruncatedCell";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LeadActionsMenu } from "./LeadActionsMenu";

const sourceVariant: Record<string, "default" | "secondary"> = {
  cta: "default",
  landing: "secondary",
  waitlist: "secondary",
};

/** "Mobile · Safari · iOS" style summary — one compact cell instead of three narrow columns. */
function deviceSummary(lead: Lead): string {
  const parts = [lead.deviceType, lead.browserName, lead.osName].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

interface LeadColumnHandlers {
  onDelete?: (lead: Lead) => void;
}

export function makeLeadColumns(handlers: LeadColumnHandlers): ColumnDef<Lead>[] {
  return [
    {
      accessorKey: "email",
      header: "Email",
      meta: { width: "24%" },
      cell: ({ row }) => (
        <TruncatedCell value={row.original.email} className="font-medium text-foreground" />
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      meta: { width: "10%" },
      cell: ({ row }) =>
        row.original.source ? (
          <Badge variant={sourceVariant[row.original.source] ?? "secondary"}>
            {row.original.source}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "country",
      header: "Country",
      meta: { width: "10%" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.country ?? "—"}</span>
      ),
    },
    {
      id: "device",
      header: "Device",
      meta: { width: "20%" },
      cell: ({ row }) => (
        <TruncatedCell value={deviceSummary(row.original)} className="text-muted-foreground" />
      ),
    },
    {
      accessorKey: "submissionCount",
      header: "Submissions",
      meta: { width: "10%", align: "right" },
      cell: ({ row }) => (
        <span className={cn(row.original.submissionCount > 1 && "font-semibold text-foreground")}>
          {row.original.submissionCount}
        </span>
      ),
    },
    {
      accessorKey: "capturedAt",
      header: "First captured",
      meta: { width: "12%" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.capturedAt)}</span>
      ),
    },
    {
      accessorKey: "lastSubmittedAt",
      header: "Last submitted",
      meta: { width: "12%" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.lastSubmittedAt)}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { width: "3.5rem", align: "center" },
      cell: ({ row }) => (
        <div
          className="flex justify-center"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <LeadActionsMenu lead={row.original} onDelete={handlers.onDelete} />
        </div>
      ),
    },
  ];
}
