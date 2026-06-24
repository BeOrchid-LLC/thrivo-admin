"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { fixtureEmailLogsPage, resolveData } from "@/lib/fixtures";
import type { EmailLog } from "@/lib/contracts";
import { DataTable } from "@/components/general/DataTable";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { TruncatedCell } from "@/components/general/TruncatedCell";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

const statusVariant: Record<
  EmailLog["status"],
  "success" | "secondary" | "destructive" | "accent"
> = {
  sent: "success",
  queued: "secondary",
  failed: "destructive",
  bounced: "accent",
};

const columns: ColumnDef<EmailLog>[] = [
  {
    accessorKey: "to",
    header: "To",
    meta: { width: "28%" },
    cell: ({ row }) => <TruncatedCell value={row.original.to} className="font-medium" />,
  },
  {
    accessorKey: "template",
    header: "Template",
    meta: { width: "22%" },
    cell: ({ row }) => <TruncatedCell value={row.original.template} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { width: "12%" },
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "error",
    header: "Error",
    meta: { width: "24%" },
    cell: ({ row }) =>
      row.original.error ? (
        <TruncatedCell value={row.original.error} />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Sent",
    meta: { width: "14%" },
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>
    ),
  },
];

export function emailLogsQuery(params: ListParams) {
  return {
    queryKey: queryKeys.emailLogs.list(params),
    queryFn: () =>
      resolveData(fixtureEmailLogsPage, () =>
        callApi("LIST_EMAIL_LOGS", { query: { page: params.page, pageSize: params.pageSize } })
      ),
  };
}

function EmailLogsTable({
  page,
  onPageChange,
}: {
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { data } = useSuspenseQuery(emailLogsQuery({ page, pageSize: DEFAULT_PAGE_SIZE }));

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No emails sent yet."
      pagination={{
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        onPageChange,
      }}
    />
  );
}

export function EmailLogsSection() {
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      <PageHeader title="Emails" description="Transactional email delivery log." />
      <QueryBoundary fallback={<TableContentSkeleton />} errorMessage="Could not load email logs.">
        <EmailLogsTable page={page} onPageChange={setPage} />
      </QueryBoundary>
    </div>
  );
}
