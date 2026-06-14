"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { fixtureEmailLogsPage, resolveData } from "@/lib/fixtures";
import type { EmailLog } from "@/lib/contracts";
import { PageHeader } from "@/components/general/PageHeader";
import { DataTable } from "@/components/general/DataTable";
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
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.to}</span>,
  },
  { accessorKey: "template", header: "Template" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "error",
    header: "Error",
    cell: ({ row }) => row.original.error ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Sent",
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

export function EmailLogsSection() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(emailLogsQuery({ page, pageSize: 12 }));

  return (
    <div>
      <PageHeader title="Emails" description="Transactional email delivery log." />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        emptyMessage="No emails sent yet."
        pagination={{
          currentPage: data?.pagination.page ?? page,
          totalPages: data?.pagination.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
