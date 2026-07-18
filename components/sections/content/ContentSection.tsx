"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type ListParams } from "@/lib/api";
import { useCapability } from "@/lib/hooks/useCapability";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { fixtureTipsPage, resolveData } from "@/lib/fixtures";
import type { Tip } from "@/lib/contracts";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { DataTable } from "@/components/general/DataTable";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";
import { TipDialog } from "./TipDialog";

export function tipsListQuery(params: ListParams) {
  return {
    queryKey: queryKeys.tips.list(params),
    queryFn: () =>
      resolveData(fixtureTipsPage, () =>
        callApi("LIST_TIPS", { query: { page: params.page, pageSize: params.pageSize } })
      ),
  };
}

function ContentTipsTable({
  page,
  onPageChange,
  onEdit,
  onDelete,
  canManage,
}: {
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (tip: Tip) => void;
  onDelete: (tip: Tip) => void;
  canManage: boolean;
}) {
  const { data } = useSuspenseQuery(tipsListQuery({ page, pageSize: DEFAULT_PAGE_SIZE }));

  const columns = useMemo<ColumnDef<Tip>[]>(
    () => [
      {
        accessorKey: "body",
        header: "Tip",
        meta: { width: "40%" },
        cell: ({ row }) => <span className="line-clamp-2">{row.original.body}</span>,
      },
      {
        accessorKey: "mood",
        header: "Mood",
        meta: { width: "12%" },
        cell: ({ row }) =>
          row.original.mood ? (
            <Badge variant="secondary">{row.original.mood}</Badge>
          ) : (
            <span className="text-muted-foreground">any</span>
          ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        meta: { width: "12%" },
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "success" : "secondary"}>
            {row.original.isActive ? "Active" : "Hidden"}
          </Badge>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        meta: { width: "16%" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.updatedAt)}</span>
        ),
      },
      // Row actions only for roles that can manage content (support+).
      ...(canManage
        ? [
            {
              id: "actions",
              header: "",
              meta: { width: "48px", align: "right" },
              cell: ({ row }) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Tip actions">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(row.original)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            } satisfies ColumnDef<Tip>,
          ]
        : []),
    ],
    [onDelete, onEdit, canManage]
  );

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No tips yet."
      pagination={{
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        onPageChange,
      }}
    />
  );
}

export function ContentSection() {
  const queryClient = useQueryClient();
  const { canManageContent } = useCapability();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | undefined>(undefined);
  const [deletingTip, setDeletingTip] = useState<Tip | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => callApi("DELETE_TIP", { params: { id } }),
    onSuccess: () => {
      toast.success("Tip deleted.");
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tips.list({ page: 1, pageSize: DEFAULT_PAGE_SIZE }),
        exact: false,
      });
    },
    onError: (error) =>
      toast.error(
        isApiError(error) && error.code === "NETWORK"
          ? "Deleting needs the backend — not connected yet."
          : "Could not delete tip."
      ),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content"
        description='The daily "Thrivo Tips" bank.'
        actions={
          canManageContent ? (
            <Button
              size="sm"
              onClick={() => {
                setEditingTip(undefined);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New tip
            </Button>
          ) : null
        }
      />

      <QueryBoundary
        key={page}
        fallback={<TableContentSkeleton />}
        errorMessage="Could not load tips."
      >
        <ContentTipsTable
          page={page}
          onPageChange={setPage}
          onEdit={(tip) => {
            setEditingTip(tip);
            setDialogOpen(true);
          }}
          onDelete={setDeletingTip}
          canManage={canManageContent}
        />
      </QueryBoundary>

      <TipDialog open={dialogOpen} onOpenChange={setDialogOpen} tip={editingTip} />

      <Dialog open={!!deletingTip} onOpenChange={(open) => !open && setDeletingTip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete tip?</DialogTitle>
            <DialogDescription className="line-clamp-3">{deletingTip?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTip(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingTip) {
                  deleteMutation.mutate(deletingTip.id, { onSettled: () => setDeletingTip(null) });
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
