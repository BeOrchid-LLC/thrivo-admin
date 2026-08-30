"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, isApiError, queryKeys, type ListParams } from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { fixtureEmailLogs, fixtureEmailLogsPage, resolveData } from "@/lib/fixtures";
import type { AdminEmailLogDetail, EmailLog } from "@/lib/contracts";
import { env } from "@/lib/config/env";
import { useCapability } from "@/lib/hooks/useCapability";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppLoader } from "@/components/general/AppLoader";
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
  ["lead_contact", "Lead contact"],
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
            template: params.template || undefined,
            from: params.from || undefined,
            toDate: params.to || undefined,
          },
        })
      ),
  };
}

function EmailDetailDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { role } = useCapability();
  const detail = useQuery({
    queryKey: queryKeys.emailLogs.detail(id ?? ""),
    queryFn: () =>
      resolveData(
        {
          emailLog: {
            ...(fixtureEmailLogs.find((item) => item.id === id) ?? fixtureEmailLogs[0]),
            parentEmailLogId: null,
            resendable: ["failed", "expired"].includes(
              fixtureEmailLogs.find((item) => item.id === id)?.status ?? ""
            ),
            resendCount: 0,
            resendHistory: [],
            lastAttemptAt: null,
            providerEventAt: null,
          } as AdminEmailLogDetail,
        },
        () => callApi("GET_EMAIL_LOG", { params: { id: id! } })
      ),
    enabled: !!id,
  });
  const emailLog = detail.data?.emailLog;
  const [resendOpen, setResendOpen] = useState(false);
  const canResend = role === "admin" || role === "super-admin";
  const resend = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({
            emailLog: { ...emailLog!, status: "queued" as const } as AdminEmailLogDetail,
          })
        : callApi("RESEND_EMAIL_LOG", {
            params: { id: emailLog!.id },
            payload: { confirmation: "RESEND" },
            idempotencyKey: crypto.randomUUID(),
          }),
    onSuccess: (result) => {
      toast.success("Email resend queued.");
      queryClient.setQueryData(queryKeys.emailLogs.detail(emailLog!.id), result);
      void queryClient.invalidateQueries({ queryKey: ["email-logs"], exact: false });
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Could not resend email."),
  });

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Email delivery</SheetTitle>
          <SheetDescription>
            {emailLog ? `${emailLog.to} · ${emailLog.kind}` : "Delivery details"}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 text-sm">
          {detail.isLoading ? (
            <AppLoader />
          ) : detail.error ? (
            <p className="text-destructive">Could not load email details.</p>
          ) : emailLog ? (
            <>
              <div className="grid gap-2 rounded-lg border p-4 sm:grid-cols-2">
                <span className="text-muted-foreground">Status</span>
                <span>{emailLog.status}</span>
                <span className="text-muted-foreground">Template</span>
                <span>{emailLog.template}</span>
                <span className="text-muted-foreground">Attempts</span>
                <span>{emailLog.attempts}</span>
                <span className="text-muted-foreground">Provider ID</span>
                <span className="break-all font-mono text-xs">
                  {emailLog.providerMessageId ?? "—"}
                </span>
                <span className="text-muted-foreground">Queued</span>
                <span>{formatDate(emailLog.createdAt)}</span>
                <span className="text-muted-foreground">Sent</span>
                <span>{formatDate(emailLog.sentAt)}</span>
                <span className="text-muted-foreground">Delivered</span>
                <span>{formatDate(emailLog.deliveredAt)}</span>
                <span className="text-muted-foreground">Failure</span>
                <span>{emailLog.error ?? emailLog.failureCode ?? "—"}</span>
              </div>
              {emailLog.parentEmailLogId ? (
                <p className="text-muted-foreground">Resent from {emailLog.parentEmailLogId}</p>
              ) : null}
              {canResend &&
              emailLog.resendable &&
              ["failed", "expired"].includes(emailLog.status) ? (
                <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-4 dark:bg-amber-950/20">
                  <p className="font-medium">Resend this message?</p>
                  <p className="mt-1 text-muted-foreground">
                    A new delivery record will be created. The recipient’s current suppression
                    status will be checked again.
                  </p>
                  <Button
                    className="mt-3"
                    variant="outline"
                    disabled={resend.isPending}
                    onClick={() => setResendOpen(true)}
                  >
                    {resend.isPending ? "Queueing…" : "Resend email"}
                  </Button>
                </div>
              ) : null}
              {emailLog.resendHistory.length > 0 ? (
                <div className="border-t pt-4">
                  <p className="font-medium">Resend history</p>
                  <div className="mt-2 space-y-2">
                    {emailLog.resendHistory.map((item) => (
                      <div key={item.id} className="rounded border p-2 text-xs">
                        <span className="font-medium">{item.status}</span> ·{" "}
                        {formatDate(item.createdAt)}
                        {item.providerMessageId ? ` · ${item.providerMessageId}` : ""}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3 border-t pt-4 text-sm">
                {emailLog.userId ? (
                  <Link className="text-primary hover:underline" href={`/users/${emailLog.userId}`}>
                    Open user
                  </Link>
                ) : null}
                {emailLog.leadId ? (
                  <Link
                    className="text-primary hover:underline"
                    href={`/leads?q=${encodeURIComponent(emailLog.to)}`}
                  >
                    Open lead
                  </Link>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
        <Dialog open={resendOpen} onOpenChange={setResendOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resend this email?</DialogTitle>
              <DialogDescription>
                A new delivery record will be created for {emailLog?.to}. This is only allowed for
                eligible failed or expired operational messages; suppression is checked again.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResendOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={resend.isPending}
                onClick={() => {
                  resend.mutate();
                  setResendOpen(false);
                }}
              >
                {resend.isPending ? "Queueing…" : "Confirm resend"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}

function EmailLogsTable({
  params,
  onPageChange,
  onRowClick,
}: {
  params: ListParams;
  onPageChange: (page: number) => void;
  onRowClick: (email: EmailLog) => void;
}) {
  const { data } = useSuspenseQuery(emailLogsQuery(params));

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No emails sent yet."
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

export function EmailLogsSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {
    filters,
    isPending,
    searchInput,
    setSearchInput,
    setStatus,
    setKind,
    setTemplate,
    setFrom,
    setTo,
    setPage,
  } = useUrlListFilters();

  const params: ListParams = {
    page: filters.page,
    pageSize: DEFAULT_PAGE_SIZE,
    status: filters.status,
    kind: filters.kind,
    q: filters.q || undefined,
    template: filters.template || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
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
        <Input
          className="w-full sm:w-44"
          placeholder="Template…"
          value={filters.template}
          onChange={(event) => setTemplate(event.target.value)}
        />
        <Input
          type="date"
          aria-label="Email logs from"
          value={filters.from.slice(0, 10)}
          onChange={(event) =>
            setFrom(event.target.value ? `${event.target.value}T00:00:00.000Z` : "")
          }
        />
        <Input
          type="date"
          aria-label="Email logs through"
          value={filters.to.slice(0, 10)}
          onChange={(event) =>
            setTo(event.target.value ? `${event.target.value}T23:59:59.999Z` : "")
          }
        />
      </div>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={`${params.page}-${params.status}-${params.kind}-${params.q}-${params.template}-${params.from}-${params.to}`}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load email logs."
        >
          <EmailLogsTable
            params={params}
            onPageChange={setPage}
            onRowClick={(email) => setSelectedId(email.id)}
          />
        </QueryBoundary>
      </div>
      <EmailDetailDrawer id={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
