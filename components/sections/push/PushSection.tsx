"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, Plus, Send } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type EndpointResponse } from "@/lib/api";
import { resolveData } from "@/lib/fixtures";
import { fixturePushCampaigns } from "@/lib/fixtures/ops";
import { env } from "@/lib/config/env";
import { useCapability } from "@/lib/hooks/useCapability";
import { useCursorPagination } from "@/lib/hooks/useCursorPagination";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { DataTable } from "@/components/general/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { CreateCampaignDialog } from "./CreateCampaignDialog";
import type { PushCampaignRow, PushSegment } from "@/lib/contracts";

function segmentLabel(s: PushSegment): string {
  if (s.all) return "Everyone";
  const parts: string[] = [];
  if (s.tier) parts.push(s.tier);
  if (s.subscriptionStatus) parts.push(`sub:${s.subscriptionStatus}`);
  if (s.lastActiveWithinDays) parts.push(`active ≤${s.lastActiveWithinDays}d`);
  return parts.join(" · ") || "—";
}

const STATUS_VARIANT: Record<string, "success" | "secondary" | "destructive"> = {
  sent: "success",
  sending: "secondary",
  draft: "secondary",
  scheduled: "secondary",
  failed: "destructive",
};

function SendDialog({
  campaign,
  onOpenChange,
}: {
  campaign: PushCampaignRow | null;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("SEND_PUSH_CAMPAIGN", { params: { id: campaign!.id } }),
    onSuccess: () => {
      if (env.useFixtures && campaign) {
        qc.setQueriesData<EndpointResponse<"LIST_PUSH_CAMPAIGNS">>(
          { queryKey: ["push", "campaigns"] },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((item) =>
                    item.id === campaign.id
                      ? {
                          ...item,
                          status: "sent",
                          sentCount: item.recipientCount,
                          sentAt: new Date().toISOString(),
                        }
                      : item
                  ),
                }
              : current
        );
      }
      toast.success("Send enqueued.");
      if (!env.useFixtures) void qc.invalidateQueries({ queryKey: ["push"], exact: false });
      onOpenChange(false);
    },
    onError: (e) => toast.error(isApiError(e) ? e.message : "Send failed."),
  });
  return (
    <Dialog open={!!campaign} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send this campaign?</DialogTitle>
          <DialogDescription>
            {campaign
              ? `"${campaign.title}" → ${segmentLabel(campaign.segment)}. This sends a real push to every matching device and cannot be undone.`
              : ""}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={mut.isPending} onClick={() => mut.mutate()}>
            Send now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampaignsTable({
  onSend,
  canSend,
}: {
  onSend: (c: PushCampaignRow) => void;
  canSend: boolean;
}) {
  const pagination = useCursorPagination();
  const params = { cursor: pagination.cursor, limit: DEFAULT_PAGE_SIZE };
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.push.campaigns(params),
    queryFn: () =>
      resolveData(fixturePushCampaigns, () => callApi("LIST_PUSH_CAMPAIGNS", { query: params })),
  });

  const columns = useMemo<ColumnDef<PushCampaignRow>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Campaign",
        meta: { width: "28%" },
        cell: ({ row }) => (
          <Link
            href={`/push/${row.original.id}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium underline-offset-2 hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { width: "12%" },
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "secondary"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "segment",
        header: "Audience",
        meta: { width: "20%" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">{segmentLabel(row.original.segment)}</span>
        ),
      },
      {
        id: "recipients",
        header: "Sent / Failed / Total",
        meta: { width: "18%", align: "right" },
        cell: ({ row }) => (
          <span className="tabular-nums text-muted-foreground">
            {row.original.sentCount} / {row.original.failedCount} / {row.original.recipientCount}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        meta: { width: "14%" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        meta: { width: "96px", align: "right" },
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Link href={`/push/${row.original.id}`} onClick={(e) => e.stopPropagation()}>
              <Button size="icon" variant="ghost" aria-label="View details">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            {canSend && (row.original.status === "draft" || row.original.status === "scheduled") ? (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Send"
                onClick={() => onSend(row.original)}
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canSend, onSend]
  );

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No campaigns yet."
      getRowId={(row) => row.id}
      cursorPagination={{
        pageNumber: pagination.pageNumber,
        hasPrev: pagination.hasPrev,
        hasNext: data.pagination.nextCursor !== null,
        onNext: () => pagination.goNext(data.pagination.nextCursor),
        onPrev: pagination.goPrev,
      }}
    />
  );
}

export function PushSection() {
  const { canManagePush } = useCapability();
  const [createOpen, setCreateOpen] = useState(false);
  const [sending, setSending] = useState<PushCampaignRow | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Push campaigns"
        description="Compose and broadcast one-off push notifications to a user segment."
        actions={
          canManagePush ? (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New campaign
            </Button>
          ) : null
        }
      />

      <QueryBoundary fallback={<TableContentSkeleton />} errorMessage="Could not load campaigns.">
        <CampaignsTable onSend={setSending} canSend={canManagePush} />
      </QueryBoundary>

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SendDialog campaign={sending} onOpenChange={(o) => !o && setSending(null)} />
    </div>
  );
}
