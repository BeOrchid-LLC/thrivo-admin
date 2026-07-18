"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import { useCapability } from "@/lib/hooks/useCapability";
import { useCursorPagination } from "@/lib/hooks/useCursorPagination";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { DataTable } from "@/components/general/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const params = { cursor: pagination.cursor, limit: DEFAULT_PAGE_SIZE };
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.moderation.notes(params),
    queryFn: () => callApi("LIST_CHECKIN_NOTES", { query: params }),
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["moderation", "notes"], exact: false });
  const redact = useMutation({
    mutationFn: (id: string) => callApi("REDACT_CHECKIN_NOTE", { params: { id } }),
    onSuccess: () => {
      toast.success("Note redacted.");
      void invalidate();
    },
    onError: onErr,
  });
  const restore = useMutation({
    mutationFn: (id: string) => callApi("RESTORE_CHECKIN_NOTE", { params: { id } }),
    onSuccess: () => {
      toast.success("Note restored.");
      void invalidate();
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
          <span className="text-muted-foreground">
            {row.original.userEmail ?? row.original.userId}
          </span>
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
              <Button size="sm" variant="outline" onClick={() => restore.mutate(row.original.id)}>
                Restore
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => redact.mutate(row.original.id)}>
                Redact
              </Button>
            )
          ) : null,
      },
    ],
    [canModerate, redact, restore]
  );

  return (
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
  );
}

function UploadsPanel({ canRemove }: { canRemove: boolean }) {
  const qc = useQueryClient();
  const pagination = useCursorPagination();
  const [removing, setRemoving] = useState<UploadRow | null>(null);
  const params = { cursor: pagination.cursor, limit: DEFAULT_PAGE_SIZE };
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.moderation.uploads(params),
    queryFn: () => callApi("LIST_MODERATION_UPLOADS", { query: params }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => callApi("REMOVE_UPLOAD", { params: { id } }),
    onSuccess: () => {
      toast.success("Image removed.");
      void qc.invalidateQueries({ queryKey: ["moderation", "uploads"], exact: false });
      setRemoving(null);
    },
    onError: onErr,
  });

  return (
    <div className="space-y-4">
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
                <p className="truncate text-xs text-muted-foreground">{u.userEmail ?? u.userId}</p>
                <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</p>
                {canRemove ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    onClick={() => setRemoving(u)}
                  >
                    Remove
                  </Button>
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

      <Dialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this image?</DialogTitle>
            <DialogDescription>
              Soft-deletes the upload and clears the user&apos;s profile image. This is audited.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => removing && remove.mutate(removing.id)}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ModerationSection() {
  const { canManageContent, canPerformSensitive } = useCapability();
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
          <NotesPanel canModerate={canManageContent} />
        ) : (
          <UploadsPanel canRemove={canPerformSensitive} />
        )}
      </QueryBoundary>
    </div>
  );
}
