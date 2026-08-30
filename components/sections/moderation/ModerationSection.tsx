"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type EndpointResponse } from "@/lib/api";
import { resolveData } from "@/lib/fixtures";
import { fixtureCheckinNotes, fixtureUploads } from "@/lib/fixtures/ops";
import { env } from "@/lib/config/env";
import { useCapability } from "@/lib/hooks/useCapability";
import { useCursorPagination } from "@/lib/hooks/useCursorPagination";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { DataTable } from "@/components/general/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { CheckinNoteRow, UploadRow } from "@/lib/contracts";

const onErr = (e: unknown) => toast.error(isApiError(e) ? e.message : "Action failed.");

function NotesPanel({ canModerate }: { canModerate: boolean }) {
  const qc = useQueryClient();
  const pagination = useCursorPagination();
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [moderating, setModerating] = useState<{ id: string; hidden: boolean } | null>(null);
  const [reason, setReason] = useState("");
  const params = {
    cursor: pagination.cursor,
    limit: DEFAULT_PAGE_SIZE,
    q: search || undefined,
    userId: userId || undefined,
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
    hiddenOnly: hiddenOnly ? "1" : undefined,
  };
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.moderation.notes(params),
    queryFn: () =>
      resolveData(fixtureCheckinNotes, () => callApi("LIST_CHECKIN_NOTES", { query: params })),
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["moderation", "notes"], exact: false });
  const redact = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("REDACT_CHECKIN_NOTE", { params: { id }, payload: { reason } }),
    onSuccess: (_result, { id }) => {
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_CHECKIN_NOTES">>(
          { queryKey: ["moderation", "notes"] },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((item) =>
                    item.id === id ? { ...item, hiddenAt: new Date().toISOString() } : item
                  ),
                }
              : current
        );
      }
      toast.success("Note redacted.");
      setModerating(null);
      setReason("");
      if (!env.useFixtures) void invalidate();
    },
    onError: onErr,
  });
  const restore = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("RESTORE_CHECKIN_NOTE", { params: { id }, payload: { reason } }),
    onSuccess: (_result, { id }) => {
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_CHECKIN_NOTES">>(
          { queryKey: ["moderation", "notes"] },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((item) =>
                    item.id === id ? { ...item, hiddenAt: null } : item
                  ),
                }
              : current
        );
      }
      toast.success("Note restored.");
      setModerating(null);
      setReason("");
      if (!env.useFixtures) void invalidate();
    },
    onError: onErr,
  });

  const columns = useMemo<ColumnDef<CheckinNoteRow>[]>(
    () => [
      {
        accessorKey: "note",
        header: "Note",
        meta: { width: "42%" },
        cell: ({ row }) => <span className="line-clamp-2">{row.original.note}</span>,
      },
      {
        accessorKey: "userEmail",
        header: "User",
        meta: { width: "22%" },
        cell: ({ row }) => (
          <Link
            href={`/users/${row.original.userId}`}
            onClick={(event) => event.stopPropagation()}
            className="text-muted-foreground hover:underline"
          >
            {row.original.userEmail ?? row.original.userId}
          </Link>
        ),
      },
      {
        accessorKey: "hiddenAt",
        header: "State",
        meta: { width: "12%" },
        cell: ({ row }) =>
          row.original.hiddenAt ? (
            <Badge variant="destructive">Redacted</Badge>
          ) : (
            <Badge variant="secondary">Visible</Badge>
          ),
      },
      {
        accessorKey: "localDate",
        header: "Date",
        meta: { width: "12%" },
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.localDate}</span>,
      },
      {
        id: "actions",
        header: "",
        meta: { width: "110px", align: "right" },
        cell: ({ row }) =>
          canModerate ? (
            row.original.hiddenAt ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModerating({ id: row.original.id, hidden: false })}
              >
                Restore
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModerating({ id: row.original.id, hidden: true })}
              >
                Redact
              </Button>
            )
          ) : null,
      },
    ],
    [canModerate]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input
          className="w-full sm:w-64"
          placeholder="Search note or user email…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            pagination.reset();
          }}
        />
        <Button
          size="sm"
          variant={hiddenOnly ? "default" : "outline"}
          onClick={() => {
            setHiddenOnly(!hiddenOnly);
            pagination.reset();
          }}
        >
          {hiddenOnly ? "Showing redacted" : "Show redacted"}
        </Button>
        <Input
          className="w-full sm:w-48"
          placeholder="User ID…"
          value={userId}
          onChange={(event) => {
            setUserId(event.target.value);
            pagination.reset();
          }}
        />
        <Input
          type="date"
          aria-label="Notes from"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            pagination.reset();
          }}
        />
        <Input
          type="date"
          aria-label="Notes through"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            pagination.reset();
          }}
        />
      </div>
      <DataTable
        columns={columns}
        data={data.items}
        emptyMessage="No check-in notes."
        getRowId={(row) => row.id}
        cursorPagination={{
          pageNumber: pagination.pageNumber,
          hasPrev: pagination.hasPrev,
          hasNext: data.pagination.nextCursor !== null,
          onNext: () => pagination.goNext(data.pagination.nextCursor),
          onPrev: pagination.goPrev,
        }}
      />
      <Dialog open={!!moderating} onOpenChange={(open) => !open && setModerating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{moderating?.hidden ? "Redact note?" : "Restore note?"}</DialogTitle>
            <DialogDescription>
              This action is audited. Add an optional reason for the record.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason (optional)"
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModerating(null)}>
              Cancel
            </Button>
            <Button
              variant={moderating?.hidden ? "destructive" : "default"}
              disabled={!moderating || redact.isPending || restore.isPending}
              onClick={() => {
                if (!moderating) return;
                const input = { id: moderating.id, reason: reason.trim() || undefined };
                if (moderating.hidden) redact.mutate(input);
                else restore.mutate(input);
              }}
            >
              {moderating?.hidden ? "Redact" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UploadsPanel({ canRemove }: { canRemove: boolean }) {
  const qc = useQueryClient();
  const pagination = useCursorPagination();
  const [moderating, setModerating] = useState<{ upload: UploadRow; remove: boolean } | null>(null);
  const [reason, setReason] = useState("");
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const params = {
    cursor: pagination.cursor,
    limit: DEFAULT_PAGE_SIZE,
    q: search || undefined,
    userId: userId || undefined,
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
    hiddenOnly: hiddenOnly ? "1" : undefined,
  };
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.moderation.uploads(params),
    queryFn: () =>
      resolveData(fixtureUploads, () => callApi("LIST_MODERATION_UPLOADS", { query: params })),
  });

  const remove = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("REMOVE_UPLOAD", { params: { id }, payload: { reason } }),
    onSuccess: (_result, { id }) => {
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_MODERATION_UPLOADS">>(
          { queryKey: ["moderation", "uploads"] },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((item) =>
                    item.id === id ? { ...item, deletedAt: new Date().toISOString() } : item
                  ),
                }
              : current
        );
      }
      toast.success("Image removed.");
      if (!env.useFixtures) {
        void qc.invalidateQueries({ queryKey: ["moderation", "uploads"], exact: false });
      }
      setModerating(null);
      setReason("");
    },
    onError: onErr,
  });
  const restore = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("RESTORE_UPLOAD", { params: { id }, payload: { reason } }),
    onSuccess: (_result, { id }) => {
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_MODERATION_UPLOADS">>(
          { queryKey: ["moderation", "uploads"] },
          (current) =>
            current
              ? {
                  ...current,
                  items: current.items.map((item) =>
                    item.id === id ? { ...item, deletedAt: null } : item
                  ),
                }
              : current
        );
      }
      toast.success("Image restored.");
      setModerating(null);
      setReason("");
      if (!env.useFixtures) {
        void qc.invalidateQueries({ queryKey: ["moderation", "uploads"], exact: false });
      }
    },
    onError: onErr,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={hiddenOnly ? "default" : "outline"}
          onClick={() => {
            setHiddenOnly(!hiddenOnly);
            pagination.reset();
          }}
        >
          {hiddenOnly ? "Showing removed" : "Show removed"}
        </Button>
        <Input
          placeholder="Filter by user email…"
          className="w-full sm:w-64"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            pagination.reset();
          }}
        />
        <Input
          placeholder="User ID…"
          className="w-full sm:w-48"
          value={userId}
          onChange={(event) => {
            setUserId(event.target.value);
            pagination.reset();
          }}
        />
        <Input
          type="date"
          aria-label="Uploads from"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            pagination.reset();
          }}
        />
        <Input
          type="date"
          aria-label="Uploads through"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            pagination.reset();
          }}
        />
      </div>
      {data.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No avatar uploads.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {data.items.map((u) => (
            <div key={u.id} className="overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.publicUrl}
                alt="avatar"
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              <div className="space-y-1 p-2">
                <Link
                  href={`/users/${u.userId}`}
                  className="block truncate text-xs text-muted-foreground hover:underline"
                >
                  {u.userEmail ?? u.userId}
                </Link>
                <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                {canRemove ? (
                  u.deletedAt ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={restore.isPending}
                      onClick={() => setModerating({ upload: u, remove: false })}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full"
                      onClick={() => setModerating({ upload: u, remove: true })}
                    >
                      Remove
                    </Button>
                  )
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!pagination.hasPrev}
          onClick={pagination.goPrev}
        >
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={data.pagination.nextCursor === null}
          onClick={() => pagination.goNext(data.pagination.nextCursor)}
        >
          Next
        </Button>
      </div>

      <Dialog open={!!moderating} onOpenChange={(o) => !o && setModerating(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderating?.remove ? "Remove this image?" : "Restore this image?"}
            </DialogTitle>
            <DialogDescription>
              {moderating?.remove
                ? "Soft-deletes the upload and clears the user's profile image."
                : "Makes the previously removed upload available again."}{" "}
              This is audited; add an optional reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason (optional)"
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setModerating(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (!moderating) return;
                const input = { id: moderating.upload.id, reason: reason.trim() || undefined };
                if (moderating.remove) remove.mutate(input);
                else restore.mutate(input);
              }}
            >
              {moderating?.remove ? "Remove" : "Restore"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ModerationSection() {
  const { canManageModeration, role } = useCapability();
  const canManageAvatars = canManageModeration && (role === "admin" || role === "super-admin");
  const [tab, setTab] = useState<"notes" | "avatars">("notes");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation"
        description="Review user-generated content: check-in notes and profile images."
      />
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant={tab === "notes" ? "default" : "outline"}
          onClick={() => setTab("notes")}
        >
          Check-in notes
        </Button>
        <Button
          size="sm"
          variant={tab === "avatars" ? "default" : "outline"}
          onClick={() => setTab("avatars")}
        >
          Avatars
        </Button>
      </div>
      <QueryBoundary
        key={tab}
        fallback={<TableContentSkeleton />}
        errorMessage="Could not load moderation queue."
      >
        {tab === "notes" ? (
          <NotesPanel canModerate={canManageModeration} />
        ) : (
          <UploadsPanel canRemove={canManageAvatars} />
        )}
      </QueryBoundary>
    </div>
  );
}
