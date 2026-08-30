"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import type { EndpointResponse } from "@/lib/api";
import { env } from "@/lib/config/env";
import { resolveData } from "@/lib/fixtures";
import { fixtureAccountErasures } from "@/lib/fixtures/ops";
import { fixtureAuditLogPage } from "@/lib/fixtures";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCapability } from "@/lib/hooks/useCapability";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function AccountErasuresSection() {
  const qc = useQueryClient();
  const { canManageErasures } = useCapability();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const query = useQuery<EndpointResponse<"LIST_ACCOUNT_ERASURES">>({
    queryKey: queryKeys.accountErasures({ page, status, search }),
    queryFn: () =>
      resolveData(
        {
          ...fixtureAccountErasures,
          erasures: fixtureAccountErasures.erasures.filter(
            (row) => status === "all" || row.status === status
          ),
        },
        () =>
          callApi("LIST_ACCOUNT_ERASURES", {
            query: {
              page,
              pageSize: 20,
              ...(status === "all" ? {} : { status }),
              search: search || undefined,
            },
          })
      ),
  });
  const retry = useMutation({
    mutationFn: (id: string) =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("RETRY_ACCOUNT_ERASURE", {
            params: { id },
            payload: { confirmation: "RETRY" },
          }),
    onSuccess: (_result, id) => {
      if (env.useFixtures) {
        qc.setQueryData<EndpointResponse<"LIST_ACCOUNT_ERASURES">>(
          queryKeys.accountErasures({ page, status, search }),
          (current) =>
            current
              ? {
                  ...current,
                  erasures: current.erasures.map((row) =>
                    row.id === id ? { ...row, status: "processing", lastErrorCode: null } : row
                  ),
                }
              : current
        );
      } else {
        void qc.invalidateQueries({
          queryKey: queryKeys.accountErasures({ page, status, search }),
        });
      }
    },
    onError: (error) =>
      toast.error(isApiError(error) ? error.message : "Could not retry account erasure."),
  });
  const rows = useMemo(() => query.data?.erasures ?? [], [query.data?.erasures]);
  const selected = query.data?.erasures.find((row) => row.id === selectedId) ?? null;
  const audit = useQuery({
    queryKey: queryKeys.auditLog.list({ page: 1, pageSize: 20, targetId: selected?.id }),
    queryFn: () =>
      resolveData(
        {
          ...fixtureAuditLogPage,
          items: fixtureAuditLogPage.items.filter((entry) => entry.targetId === selected?.id),
        },
        () =>
          callApi("LIST_AUDIT_LOG", {
            query: { page: 1, pageSize: 20, targetType: "account_erasure", targetId: selected?.id },
          })
      ),
    enabled: !!selected,
  });
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Account erasures</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Durable deletion jobs and retry state.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
          >
            {query.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Label htmlFor="erasure-search">Search</Label>
          <Input
            id="erasure-search"
            className="w-64"
            placeholder="Erasure ID, user, or email…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Label htmlFor="erasure-status">Status</Label>
          <select
            id="erasure-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border bg-background px-2 text-sm"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="retryable">Retryable</option>
            <option value="failed">Failed</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading erasures…</p>
        ) : null}
        {query.error ? <p className="text-sm text-destructive">Could not load erasures.</p> : null}
        <div className="space-y-2 text-sm">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedId(row.id)}
              className="flex w-full items-center justify-between gap-4 border-b py-3 text-left hover:bg-muted/40"
            >
              <div>
                <div className="flex items-center gap-2 font-medium">
                  <Badge variant={row.status === "failed" ? "destructive" : "secondary"}>
                    {row.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  Requested {formatDate(row.requestedAt)} · Attempts {row.attempts}
                </div>
                {row.userEmail ? (
                  <Link
                    href={`/users/${row.userId}`}
                    className="text-primary hover:underline"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {row.userEmail}
                  </Link>
                ) : row.userId ? (
                  <div className="text-muted-foreground">User {row.userId}</div>
                ) : null}
                {row.lastErrorCode ? (
                  <div className="text-destructive">Last error: {row.lastErrorCode}</div>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground">View details</span>
            </button>
          ))}
          {query.data && rows.length === 0 ? (
            <p className="text-muted-foreground">No erasures queued.</p>
          ) : null}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {query.data?.pagination.page ?? page} of {query.data?.pagination.totalPages ?? 1}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || query.isFetching}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (query.data?.pagination.totalPages ?? 1) || query.isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Erasure details</DialogTitle>
              <DialogDescription>
                Deletion is durable and each retry is audited by the backend.
              </DialogDescription>
            </DialogHeader>
            {selected ? (
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Status:</strong> {selected.status}
                </div>
                {selected.userEmail ? (
                  <div>
                    <strong>User:</strong>{" "}
                    <Link
                      className="text-primary hover:underline"
                      href={`/users/${selected.userId}`}
                    >
                      {selected.userEmail}
                    </Link>
                  </div>
                ) : selected.userId ? (
                  <div>
                    <strong>User ID:</strong> {selected.userId}
                  </div>
                ) : null}
                <div>
                  <strong>Requested:</strong> {formatDate(selected.requestedAt)}
                </div>
                <div>
                  <strong>Attempts:</strong> {selected.attempts}
                </div>
                <div>
                  <strong>Completed:</strong>{" "}
                  {selected.completedAt ? formatDate(selected.completedAt) : "Not completed"}
                </div>
                <div>
                  <strong>Last error:</strong> {selected.lastErrorCode ?? "None"}
                </div>
                <div>
                  <strong>Phase:</strong> {selected.phase}
                </div>
                <div>
                  <strong>Processing started:</strong>{" "}
                  {selected.processingStartedAt
                    ? formatDate(selected.processingStartedAt)
                    : "Not started"}
                </div>
                {canManageErasures &&
                (selected.status === "failed" || selected.status === "retryable") ? (
                  <Button onClick={() => retry.mutate(selected.id)} disabled={retry.isPending}>
                    {retry.isPending ? "Retrying…" : "Retry erasure"}
                  </Button>
                ) : null}
                <div className="border-t pt-3">
                  <strong>Audit events</strong>
                  {audit.isLoading ? (
                    <p className="mt-1 text-muted-foreground">Loading audit events…</p>
                  ) : audit.data?.items.length ? (
                    <div className="mt-2 space-y-2">
                      {audit.data.items.map((entry) => (
                        <div key={entry.id} className="rounded border p-2">
                          <div className="font-medium">{entry.action}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.actorEmail} · {formatDate(entry.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-muted-foreground">No audit events recorded.</p>
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
