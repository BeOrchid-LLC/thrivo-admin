"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, Plus, Send, Pencil, Ban, FlaskConical } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  canceled: "destructive",
};

export function SendDialog({
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

export function EditCampaignDialog({
  campaign,
  onOpenChange,
}: {
  campaign: PushCampaignRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [body, setBody] = useState(campaign?.body ?? "");
  const [deepLink, setDeepLink] = useState(campaign?.deepLink ?? "");
  const [scheduledAt, setScheduledAt] = useState(
    campaign?.scheduledAt ? campaign.scheduledAt.slice(0, 16) : ""
  );
  useEffect(() => {
    setTitle(campaign?.title ?? "");
    setBody(campaign?.body ?? "");
    setDeepLink(campaign?.deepLink ?? "");
    setScheduledAt(campaign?.scheduledAt ? campaign.scheduledAt.slice(0, 16) : "");
  }, [campaign?.id, campaign?.title, campaign?.body, campaign?.deepLink, campaign?.scheduledAt]);
  const mutation = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({
            campaign: {
              ...campaign!,
              title,
              body,
              deepLink: deepLink || null,
              scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
              status: scheduledAt ? ("scheduled" as const) : ("draft" as const),
            },
          })
        : callApi("UPDATE_PUSH_CAMPAIGN", {
            params: { id: campaign!.id },
            payload: {
              title,
              body,
              deepLink: deepLink || null,
              scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
            },
          }),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.push.campaign(campaign!.id), data);
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_PUSH_CAMPAIGNS">>(
          { queryKey: ["push", "campaigns"] },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((item) =>
                    item.id === campaign!.id ? { ...item, ...data.campaign } : item
                  ),
                }
              : current
        );
      }
      if (!env.useFixtures) void qc.invalidateQueries({ queryKey: ["push"], exact: false });
      toast.success("Campaign updated.");
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(isApiError(error) ? error.message : "Could not update campaign."),
  });
  return (
    <Dialog open={!!campaign} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit draft campaign</DialogTitle>
          <DialogDescription>Only draft campaigns can be edited.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="campaign-title">Title</Label>
            <Input
              id="campaign-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="campaign-body">Message</Label>
            <Textarea
              id="campaign-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="campaign-link">Deep link</Label>
            <Input
              id="campaign-link"
              value={deepLink}
              onChange={(event) => setDeepLink(event.target.value)}
              placeholder="thrivo://…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="campaign-schedule">Schedule (optional)</Label>
            <Input
              id="campaign-schedule"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank for a draft, or choose a future time to schedule dispatch.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={mutation.isPending || !title.trim() || !body.trim()}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Saving…" : "Save draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CampaignLifecycleDialog({
  campaign,
  mode,
  onOpenChange,
}: {
  campaign: PushCampaignRow | null;
  mode: "cancel" | "test";
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({
            campaign: mode === "cancel" ? { ...campaign!, status: "canceled" as const } : campaign!,
          })
        : mode === "cancel"
          ? callApi("CANCEL_PUSH_CAMPAIGN", {
              params: { id: campaign!.id },
              payload: { confirmation: "CANCEL" },
            })
          : callApi("TEST_PUSH_CAMPAIGN", {
              params: { id: campaign!.id },
              payload: { confirmation: "SEND_TEST" },
              idempotencyKey: crypto.randomUUID(),
            }),
    onSuccess: (result) => {
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_PUSH_CAMPAIGNS">>(
          { queryKey: ["push", "campaigns"] },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((item) =>
                    item.id === campaign!.id ? { ...item, ...result.campaign } : item
                  ),
                }
              : current
        );
        qc.setQueryData(queryKeys.push.campaign(campaign!.id), result);
      }
      toast.success(mode === "cancel" ? "Campaign canceled." : "Test push queued.");
      if (!env.useFixtures) void qc.invalidateQueries({ queryKey: ["push"], exact: false });
      onOpenChange(false);
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Campaign action failed."),
  });
  return (
    <Dialog open={!!campaign} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "cancel" ? "Cancel scheduled campaign?" : "Send test push?"}
          </DialogTitle>
          <DialogDescription>
            {mode === "cancel"
              ? `“${campaign?.title}” will not be dispatched.`
              : "This sends only to the configured internal test recipients. Production users cannot be selected here."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back
          </Button>
          <Button
            variant={mode === "cancel" ? "destructive" : "default"}
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Working…" : mode === "cancel" ? "Cancel campaign" : "Send test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampaignsTable({
  onSend,
  onEdit,
  onCancel,
  onTest,
  canManage,
  canSend,
  canTest,
}: {
  onSend: (c: PushCampaignRow) => void;
  onEdit: (c: PushCampaignRow) => void;
  onCancel: (c: PushCampaignRow) => void;
  onTest: (c: PushCampaignRow) => void;
  canManage: boolean;
  canSend: boolean;
  canTest: boolean;
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
            {canManage && row.original.status === "draft" ? (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Edit draft"
                onClick={() => onEdit(row.original)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
            {canManage && row.original.status === "scheduled" ? (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Cancel scheduled campaign"
                onClick={() => onCancel(row.original)}
              >
                <Ban className="h-4 w-4" />
              </Button>
            ) : null}
            {canTest && (row.original.status === "draft" || row.original.status === "scheduled") ? (
              <Button
                size="icon"
                variant="ghost"
                aria-label="Send test push"
                onClick={() => onTest(row.original)}
              >
                <FlaskConical className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canManage, canSend, canTest, onCancel, onEdit, onSend, onTest]
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
  const { canManagePush, role } = useCapability();
  const canSendPush = canManagePush && (role === "admin" || role === "super-admin");
  const [createOpen, setCreateOpen] = useState(false);
  const [sending, setSending] = useState<PushCampaignRow | null>(null);
  const [editing, setEditing] = useState<PushCampaignRow | null>(null);
  const [canceling, setCanceling] = useState<PushCampaignRow | null>(null);
  const [testing, setTesting] = useState<PushCampaignRow | null>(null);

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
        <CampaignsTable
          onSend={setSending}
          onEdit={setEditing}
          onCancel={setCanceling}
          onTest={setTesting}
          canManage={canManagePush}
          canSend={canSendPush}
          canTest={canSendPush}
        />
      </QueryBoundary>

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SendDialog campaign={sending} onOpenChange={(o) => !o && setSending(null)} />
      <EditCampaignDialog campaign={editing} onOpenChange={(o) => !o && setEditing(null)} />
      <CampaignLifecycleDialog
        campaign={canceling}
        mode="cancel"
        onOpenChange={(o) => !o && setCanceling(null)}
      />
      <CampaignLifecycleDialog
        campaign={testing}
        mode="test"
        onOpenChange={(o) => !o && setTesting(null)}
      />
    </div>
  );
}
