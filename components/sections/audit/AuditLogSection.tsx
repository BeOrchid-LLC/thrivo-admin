"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { fixtureAuditLogPage, resolveData } from "@/lib/fixtures";
import type { AuditLogEntry } from "@/lib/contracts";
import { PageHeader } from "@/components/general/PageHeader";
import { DataTable } from "@/components/general/DataTable";
import { ErrorState } from "@/components/general/states";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

const columns: ColumnDef<AuditLogEntry>[] = [
  {
    accessorKey: "createdAt",
    header: "When",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "actorEmail",
    header: "Actor",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.actorEmail}</span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
  },
  {
    accessorKey: "targetType",
    header: "Target",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.targetType}
        {row.original.targetId ? ` · ${row.original.targetId}` : ""}
      </span>
    ),
  },
  {
    accessorKey: "requestId",
    header: "Request",
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
        callApi("LIST_AUDIT_LOG", { query: { page: params.page, pageSize: params.pageSize } })
      ),
  };
}

export function AuditLogSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery(auditLogQuery({ page, pageSize: 12 }));

  return (
    <div>
      <PageHeader title="Audit log" description="Every admin mutation: who, what, when." />
      {isError && <ErrorState onRetry={() => refetch()} />}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        emptyMessage="No audit entries yet."
        pagination={{
          currentPage: data?.pagination.page ?? page,
          totalPages: data?.pagination.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
