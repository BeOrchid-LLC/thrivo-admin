"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { fixtureEmailLogsPage, resolveData } from "@/lib/fixtures";
import type { EmailLog } from "@/lib/contracts";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import { DataTable } from "@/components/general/DataTable";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { TruncatedCell } from "@/components/general/TruncatedCell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

const statusVariant: Record<
  EmailLog["status"],
  "success" | "secondary" | "destructive" | "accent"
> = {
  sent: "success",
  delivered: "success",
  queued: "secondary",
  processing: "secondary",
  retrying: "accent",
  failed: "destructive",
  bounced: "accent",
  complained: "destructive",
  suppressed: "destructive",
  expired: "secondary",
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "sent", label: "Accepted" },
  { value: "delivered", label: "Delivered" },
  { value: "queued", label: "Queued" },
  { value: "failed", label: "Failed" },
  { value: "bounced", label: "Bounced" },
];

const KIND_OPTIONS = [
  ["all", "All kinds"],
  ["welcome", "Welcome"],
  ["weekly_review", "Weekly review"],
  ["trial_ending", "Trial ending"],
  ["cancellation_confirmation", "Cancellation"],
  ["admin_otp", "Admin OTP"],
  ["admin_invite", "Admin invite"],
  ["admin_password_reset", "Admin reset"],
  ["legacy_notification", "Legacy"],
] as const;

const columns: ColumnDef<EmailLog>[] = [
  {
    accessorKey: "to",
    header: "To",
    meta: { width: "28%" },
    cell: ({ row }) => <TruncatedCell value={row.original.to} className="font-medium" />,
  },
  {
    accessorKey: "kind",
    header: "Kind",
    meta: { width: "22%" },
    cell: ({ row }) => <TruncatedCell value={row.original.kind.replaceAll("_", " ")} />,
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { width: "12%" },
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status === "sent" ? "provider accepted" : row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "attempts",
    header: "Attempts / issue",
    meta: { width: "24%" },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span>{row.original.attempts}</span>
        {(row.original.error || row.original.failureCode) && (
          <TruncatedCell value={row.original.error ?? row.original.failureCode ?? ""} />
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Queued",
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
        callApi("LIST_EMAIL_LOGS", {
          query: {
            page: params.page,
            pageSize: params.pageSize,
            status: params.status && params.status !== "all" ? params.status : undefined,
            kind: params.kind && params.kind !== "all" ? params.kind : undefined,
            to: params.q || undefined,
          },
        })
      ),
  };
}

function EmailLogsTable({
  params,
  onPageChange,
}: {
  params: ListParams;
  onPageChange: (page: number) => void;
}) {
  const { data } = useSuspenseQuery(emailLogsQuery(params));

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
  const { filters, isPending, searchInput, setSearchInput, setStatus, setKind, setPage } =
    useUrlListFilters();

  const params: ListParams = {
    page: filters.page,
    pageSize: DEFAULT_PAGE_SIZE,
    status: filters.status,
    kind: filters.kind,
    q: filters.q || undefined,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emails"
        description="Email queue, provider acceptance, and delivery outcomes."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={filters.status} onValueChange={setStatus} className="flex-1">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select value={filters.kind} onValueChange={setKind}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Email kind" />
          </SelectTrigger>
          <SelectContent>
            {KIND_OPTIONS.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="w-full sm:w-64"
          placeholder="Search recipient…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={`${params.page}-${params.status}-${params.kind}-${params.q}`}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load email logs."
        >
          <EmailLogsTable params={params} onPageChange={setPage} />
        </QueryBoundary>
      </div>
    </div>
  );
}
