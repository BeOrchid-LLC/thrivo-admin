"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, queryKeys } from "@/lib/api";
import { env } from "@/lib/config/env";
import { resolveData } from "@/lib/fixtures";
import { fixtureBillingEvents, fixtureWebhookDetail, fixtureWebhooks } from "@/lib/fixtures/ops";
import { useCapability } from "@/lib/hooks/useCapability";
import { useCursorPagination } from "@/lib/hooks/useCursorPagination";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { DataTable } from "@/components/general/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { isApiError } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppLoader } from "@/components/general/AppLoader";
import { formatMoney, formatDate } from "@/lib/format";
import type { SubscriptionEvent, WebhookEventRow, WebhookEventDetail } from "@/lib/contracts";

const DEFAULT_LIMIT = 20;

function EventsPanel() {
  const [eventType, setEventType] = useState("all");
  const pagination = useCursorPagination();
  const params = {
    cursor: pagination.cursor,
    limit: DEFAULT_LIMIT,
    eventType: eventType === "all" ? undefined : eventType,
  };
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.billing.events(params),
    queryFn: () =>
      resolveData(fixtureBillingEvents, () => callApi("LIST_BILLING_EVENTS", { query: params })),
  });

  const columns = useMemo<ColumnDef<SubscriptionEvent>[]>(
    () => [
      {
        accessorKey: "eventType",
        header: "Event",
        meta: { width: "22%" },
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.eventType.replace(/_/g, " ")}</Badge>
        ),
      },
      {
        accessorKey: "userEmail",
        header: "User",
        meta: { width: "30%" },
        cell: ({ row }) =>
          row.original.userId ? (
            <Link
              href={`/users/${row.original.userId}`}
              className="text-muted-foreground hover:underline"
            >
              {row.original.userEmail ?? row.original.userId}
            </Link>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "priceAmountCents",
        header: "Amount",
        meta: { width: "14%", align: "right" },
        cell: ({ row }) =>
          row.original.priceAmountCents !== null ? (
            <span className="tabular-nums">
              {formatMoney(row.original.priceAmountCents, row.original.currency)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "occurredAt",
        header: "When",
        meta: { width: "20%" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.occurredAt)}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <Select
        value={eventType}
        onValueChange={(value) => {
          setEventType(value);
          pagination.reset();
        }}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Event type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All event types</SelectItem>
          {[
            "trial_started",
            "trial_converted",
            "renewed",
            "expired",
            "canceled",
            "billing_issue",
            "refunded",
            "refund_reversed",
            "product_changed",
            "subscription_extended",
          ].map((value) => (
            <SelectItem key={value} value={value}>
              {value.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable
        columns={columns}
        data={data.items}
        emptyMessage="No subscription events yet."
        getRowId={(row) => row.id}
        cursorPagination={{
          pageNumber: pagination.pageNumber,
          hasPrev: pagination.hasPrev,
          hasNext: data.pagination.nextCursor !== null,
          onNext: () => pagination.goNext(data.pagination.nextCursor),
          onPrev: pagination.goPrev,
        }}
      />
    </div>
  );
}

function WebhookPayloadDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.billing.webhookDetail(id ?? ""),
    queryFn: () =>
      resolveData(fixtureWebhookDetail, () => callApi("GET_WEBHOOK", { params: { id: id! } })),
    enabled: !!id,
  });
  const webhook = data?.webhook as WebhookEventDetail | undefined;
  const reprocess = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({ outcome: { stateChanged: false } })
        : callApi("REPROCESS_WEBHOOK", {
            params: { id: id! },
            payload: { confirmation: "REPROCESS" },
            idempotencyKey: crypto.randomUUID(),
          }),
    onSuccess: (result) => {
      toast.success(`Webhook reprocessed${result.outcome ? "." : " — no state change."}`);
      setConfirmOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["billing"], exact: false });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.webhookDetail(id ?? "") });
    },
    onError: (error) =>
      toast.error(isApiError(error) ? error.message : "Could not reprocess webhook."),
  });

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Webhook payload</SheetTitle>
          <SheetDescription>
            {webhook
              ? `${webhook.provider} · ${webhook.eventId} · ${webhook.status}`
              : "Raw delivery"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          {isLoading ? (
            <AppLoader />
          ) : error ? (
            <p className="text-sm text-destructive">Payload is available to admins only.</p>
          ) : webhook?.payload &&
            typeof webhook.payload === "object" &&
            (webhook.payload as { redacted?: boolean }).redacted ? (
            <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              Payload redacted.
            </p>
          ) : (
            <>
              <pre className="max-h-[55vh] overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                {JSON.stringify(webhook?.payload ?? {}, null, 2)}
              </pre>
              {webhook &&
              ["failed", "quarantined"].includes(webhook.status) &&
              webhook.provider === "revenuecat" ? (
                <Button className="mt-4" variant="outline" onClick={() => setConfirmOpen(true)}>
                  Reprocess webhook
                </Button>
              ) : null}
            </>
          )}
        </div>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reprocess webhook?</DialogTitle>
              <DialogDescription>
                This invokes the verified RevenueCat webhook processor. Reprocessing is idempotent,
                but may update subscription state.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={reprocess.isPending}
                onClick={() => reprocess.mutate()}
              >
                {reprocess.isPending ? "Processing…" : "Reprocess"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

function WebhooksPanel() {
  const { canManageBilling, role } = useCapability();
  const canViewWebhookPayload = canManageBilling && (role === "admin" || role === "super-admin");
  const pagination = useCursorPagination();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [provider, setProvider] = useState("all");
  const [status, setStatus] = useState("all");
  const params = {
    cursor: pagination.cursor,
    limit: DEFAULT_LIMIT,
    provider: provider === "all" ? undefined : provider,
    status: status === "all" ? undefined : status,
  };
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.billing.webhooks(params),
    queryFn: () => resolveData(fixtureWebhooks, () => callApi("LIST_WEBHOOKS", { query: params })),
  });

  const columns = useMemo<ColumnDef<WebhookEventRow>[]>(
    () => [
      {
        accessorKey: "provider",
        header: "Provider",
        meta: { width: "18%" },
        cell: ({ row }) => <Badge variant="secondary">{row.original.provider}</Badge>,
      },
      {
        accessorKey: "eventId",
        header: "Event ID",
        meta: { width: "30%" },
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.eventId}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { width: "16%" },
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === "processed"
                ? "success"
                : row.original.status === "failed"
                  ? "destructive"
                  : "secondary"
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "receivedAt",
        header: "Received",
        meta: { width: "22%" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.receivedAt)}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          value={provider}
          onValueChange={(value) => {
            setProvider(value);
            pagination.reset();
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem>
            <SelectItem value="revenuecat">RevenueCat</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            pagination.reset();
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="quarantined">Quarantined</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={data.items}
        emptyMessage="No webhook deliveries yet."
        getRowId={(row) => row.id}
        onRowClick={canViewWebhookPayload ? (row) => setSelectedId(row.id) : undefined}
        cursorPagination={{
          pageNumber: pagination.pageNumber,
          hasPrev: pagination.hasPrev,
          hasNext: data.pagination.nextCursor !== null,
          onNext: () => pagination.goNext(data.pagination.nextCursor),
          onPrev: pagination.goPrev,
        }}
      />
      <WebhookPayloadDrawer id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}

export function BillingSection() {
  const [tab, setTab] = useState<"events" | "webhooks">("events");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing events"
        description="Subscription funnel history and raw webhook deliveries for reconciliation."
      />
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant={tab === "events" ? "default" : "outline"}
          onClick={() => setTab("events")}
        >
          Events
        </Button>
        <Button
          size="sm"
          variant={tab === "webhooks" ? "default" : "outline"}
          onClick={() => setTab("webhooks")}
        >
          Webhooks
        </Button>
      </div>
      <QueryBoundary
        key={tab}
        fallback={<TableContentSkeleton />}
        errorMessage="Could not load billing data."
      >
        {tab === "events" ? <EventsPanel /> : <WebhooksPanel />}
      </QueryBoundary>
    </div>
  );
}
