"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
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
    cell: ({ row }) => (
      <TruncatedCell
        value={`${row.original.targetType}${row.original.targetId ? ` · ${row.original.targetId}` : ""}`}
      />
    ),
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
            actorEmail: params.q || undefined,
          },
        })
      ),
  };
}

interface AuditLogTableProps {
  params: ListParams;
  onPageChange: (page: number) => void;
}

export function AuditLogTable({ params, onPageChange }: AuditLogTableProps) {
  const { data } = useSuspenseQuery(auditLogQuery(params));

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No audit entries yet."
      pagination={{
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        onPageChange,
      }}
    />
  );
}

export function AuditLogSection() {
  const { filters, isPending, searchInput, setSearchInput, setPage } = useUrlListFilters();

  const params: ListParams = {
    page: filters.page,
    pageSize: DEFAULT_PAGE_SIZE,
    q: filters.q || undefined,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="Every admin mutation: who, what, when." />

      <div className="flex items-center gap-3">
        <Input
          className="w-full sm:w-72"
          placeholder="Filter by actor email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={`${params.page}-${params.q}`}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load audit log."
        >
          <AuditLogTable params={params} onPageChange={setPage} />
        </QueryBoundary>
      </div>
    </div>
  );
}
