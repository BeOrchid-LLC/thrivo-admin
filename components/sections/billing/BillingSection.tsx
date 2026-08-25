"use client";

import { useMemo, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, queryKeys } from "@/lib/api";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AppLoader } from "@/components/general/AppLoader";
import { formatMoney, formatDate } from "@/lib/format";
import type { SubscriptionEvent, WebhookEventRow, WebhookEventDetail } from "@/lib/contracts";

const DEFAULT_LIMIT = 20;

function EventsPanel() {
  const pagination = useCursorPagination();
  const params = { cursor: pagination.cursor, limit: DEFAULT_LIMIT };
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
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.userEmail ?? row.original.userId}
          </span>
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
  );
}

function WebhookPayloadDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.billing.webhookDetail(id ?? ""),
    queryFn: () =>
      resolveData(fixtureWebhookDetail, () => callApi("GET_WEBHOOK", { params: { id: id! } })),
    enabled: !!id,
  });
  const webhook = data?.webhook as WebhookEventDetail | undefined;

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
            <pre className="max-h-[70vh] overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
              {JSON.stringify(webhook?.payload ?? {}, null, 2)}
            </pre>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function WebhooksPanel() {
  const { canManageBilling } = useCapability();
  const pagination = useCursorPagination();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const params = { cursor: pagination.cursor, limit: DEFAULT_LIMIT };
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
    <>
      <DataTable
        columns={columns}
        data={data.items}
        emptyMessage="No webhook deliveries yet."
        getRowId={(row) => row.id}
        onRowClick={canManageBilling ? (row) => setSelectedId(row.id) : undefined}
        cursorPagination={{
          pageNumber: pagination.pageNumber,
          hasPrev: pagination.hasPrev,
          hasNext: data.pagination.nextCursor !== null,
          onNext: () => pagination.goNext(data.pagination.nextCursor),
          onPrev: pagination.goPrev,
        }}
      />
      <WebhookPayloadDrawer id={selectedId} onClose={() => setSelectedId(null)} />
    </>
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
