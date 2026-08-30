"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, downloadApi, queryKeys, type ListParams } from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { fixtureAuditLogPage, resolveData } from "@/lib/fixtures";
import type { AuditLogEntry } from "@/lib/contracts";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import { DataTable } from "@/components/general/DataTable";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { TruncatedCell } from "@/components/general/TruncatedCell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { AppLoader } from "@/components/general/AppLoader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const columns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: "createdAt",
    header: "When",
    meta: { width: "14%" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "actorEmail",
    header: "Actor",
    meta: { width: "22%" },
    cell: ({ row }) => <TruncatedCell value={row.original.actorEmail} className="font-medium" />,
  },
  {
    accessorKey: "action",
    header: "Action",
    meta: { width: "14%" },
    cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
  },
  {
    accessorKey: "targetType",
    header: "Target",
    meta: { width: "22%" },
    cell: ({ row }) => {
      const href = targetHref(row.original.targetType, row.original.targetId);
      const label = `${row.original.targetType}${row.original.targetId ? ` · ${row.original.targetId}` : ""}`;
      return href ? (
        <Link
          href={href}
          onClick={(event) => event.stopPropagation()}
          className="block text-primary hover:underline"
        >
          <TruncatedCell value={label} />
        </Link>
      ) : (
        <TruncatedCell value={label} />
      );
    },
  },
  {
    accessorKey: "requestId",
    header: "Request",
    meta: { width: "28%" },
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.requestId ?? "—"}
      </span>
    ),
  },
];

export function auditLogQuery(params: ListParams) {
  return {
    queryKey: queryKeys.auditLog.list(params),
    queryFn: () =>
      resolveData(fixtureAuditLogPage, () =>
        callApi("LIST_AUDIT_LOG", {
          query: {
            page: params.page,
            pageSize: params.pageSize,
            q: params.q || undefined,
            action: params.status !== "all" ? params.status : undefined,
            targetType: params.kind !== "all" ? params.kind : undefined,
            targetId: params.targetId || undefined,
            from: params.from || undefined,
            to: params.to || undefined,
            requestId: params.requestId || undefined,
          },
        })
      ),
  };
}

function targetHref(targetType: string, targetId: string | null): string | null {
  if (!targetId) return null;
  const routes: Record<string, string> = {
    user: `/users/${targetId}`,
    admin: `/admins?selected=${encodeURIComponent(targetId)}`,
    food: `/foods/${targetId}`,
    food_item: `/foods/${targetId}`,
    lead: `/leads?selected=${encodeURIComponent(targetId)}`,
    push_campaign: `/push/${targetId}`,
    webhook: `/billing?webhook=${encodeURIComponent(targetId)}`,
    email_log: `/emails?targetId=${encodeURIComponent(targetId)}`,
    account_erasure: `/account-erasures?selected=${encodeURIComponent(targetId)}`,
    check_in: `/moderation?note=${encodeURIComponent(targetId)}`,
    upload: `/moderation?upload=${encodeURIComponent(targetId)}`,
    tip: `/content?targetId=${encodeURIComponent(targetId)}`,
    settings: `/settings`,
    global_settings: `/settings`,
  };
  return routes[targetType] ?? null;
}

function AuditDetailDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.auditLog.detail(id ?? ""),
    queryFn: () => callApi("GET_AUDIT_LOG", { params: { id: id! } }),
    enabled: !!id,
  });
  const entry = data?.entry;
  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Audit entry</SheetTitle>
          <SheetDescription>
            {entry ? `${entry.action} · ${entry.actorEmail}` : "Mutation details"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 text-sm">
          {isLoading ? (
            <AppLoader />
          ) : error ? (
            <p className="text-destructive">Could not load audit details.</p>
          ) : entry ? (
            <>
              <div className="grid gap-2 rounded-lg border p-4 sm:grid-cols-2">
                <span className="text-muted-foreground">Target</span>
                <span>
                  {targetHref(entry.targetType, entry.targetId) ? (
                    <Link
                      className="text-primary hover:underline"
                      href={targetHref(entry.targetType, entry.targetId)!}
                    >
                      {entry.targetType} · {entry.targetId ?? "—"}
                    </Link>
                  ) : (
                    `${entry.targetType} · ${entry.targetId ?? "—"}`
                  )}
                </span>
                <span className="text-muted-foreground">Request ID</span>
                <span className="break-all font-mono text-xs">{entry.requestId ?? "—"}</span>
                <span className="text-muted-foreground">IP</span>
                <span>{entry.ip ?? "—"}</span>
                <span className="text-muted-foreground">When</span>
                <span>{formatDate(entry.createdAt)}</span>
              </div>
              <div>
                <p className="mb-1 font-medium">Before</p>
                <pre className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                  {JSON.stringify(entry.before ?? null, null, 2)}
                </pre>
              </div>
              <div>
                <p className="mb-1 font-medium">After</p>
                <pre className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                  {JSON.stringify(entry.after ?? null, null, 2)}
                </pre>
              </div>
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface AuditLogTableProps {
  params: ListParams;
  onPageChange: (page: number) => void;
}

export function AuditLogTable({
  params,
  onPageChange,
  onRowClick,
}: AuditLogTableProps & { onRowClick: (entry: AuditLogEntry) => void }) {
  const { data } = useSuspenseQuery(auditLogQuery(params));

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No audit entries yet."
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      pagination={{
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        onPageChange,
      }}
    />
  );
}

export function AuditLogSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    filters,
    isPending,
    searchInput,
    setSearchInput,
    setStatus,
    setKind,
    setTargetId,
    setRequestId,
    setFrom,
    setTo,
    setPage,
  } = useUrlListFilters();

  const params: ListParams = {
    page: filters.page,
    pageSize: DEFAULT_PAGE_SIZE,
    q: filters.q || undefined,
    status: filters.status,
    kind: filters.kind,
    targetId: filters.targetId || undefined,
    requestId: filters.requestId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Every admin mutation: who, what, when." />

      <div className="flex items-center gap-3">
        <Input
          className="w-full sm:w-72"
          placeholder="Search actor, action, target…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Input
          className="w-full sm:w-44"
          placeholder="Action…"
          value={filters.status === "all" ? "" : filters.status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Input
          className="w-full sm:w-44"
          placeholder="Target type…"
          value={filters.kind === "all" ? "" : filters.kind}
          onChange={(e) => setKind(e.target.value)}
        />
        <Input
          className="w-full sm:w-44"
          placeholder="Target ID…"
          value={filters.targetId}
          onChange={(e) => setTargetId(e.target.value)}
        />
        <Input
          className="w-full sm:w-44"
          placeholder="Request ID…"
          value={filters.requestId}
          onChange={(e) => setRequestId(e.target.value)}
        />
        <Input
          type="date"
          aria-label="Audit from"
          value={filters.from.slice(0, 10)}
          onChange={(e) => setFrom(e.target.value ? `${e.target.value}T00:00:00.000Z` : "")}
        />
        <Input
          type="date"
          aria-label="Audit through"
          value={filters.to.slice(0, 10)}
          onChange={(e) => setTo(e.target.value ? `${e.target.value}T23:59:59.999Z` : "")}
        />
        <Button
          variant="outline"
          onClick={() =>
            void downloadApi("EXPORT_AUDIT_LOG", {
              query: {
                action: filters.status !== "all" ? filters.status : undefined,
                targetType: filters.kind !== "all" ? filters.kind : undefined,
                targetId: filters.targetId || undefined,
                q: filters.q || undefined,
                from: filters.from || undefined,
                to: filters.to || undefined,
                requestId: filters.requestId || undefined,
              },
            }).then((blob) => {
              const href = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = href;
              anchor.download = "audit-log.csv";
              anchor.click();
              URL.revokeObjectURL(href);
            })
          }
        >
          Export CSV
        </Button>
      </div>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={`${params.page}-${params.q}-${params.status}-${params.kind}-${params.targetId}-${params.requestId}-${params.from}-${params.to}`}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load audit log."
        >
          <AuditLogTable
            params={params}
            onPageChange={setPage}
            onRowClick={(entry) => setSelectedId(entry.id)}
          />
        </QueryBoundary>
      </div>
      <AuditDetailDrawer id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
