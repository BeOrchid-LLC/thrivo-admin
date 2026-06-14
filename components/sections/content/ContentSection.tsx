"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type ListParams } from "@/lib/api";
import { fixtureTipsPage, resolveData } from "@/lib/fixtures";
import type { Tip } from "@/lib/contracts";
import { PageHeader } from "@/components/general/PageHeader";
import { DataTable } from "@/components/general/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function ContentSection() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<Tip | undefined>(undefined);

  const { data, isLoading } = useQuery(tipsListQuery({ page, pageSize: 12 }));

  const deleteMutation = useMutation({
    mutationFn: (id: string) => callApi("DELETE_TIP", { params: { id } }),
    onSuccess: () => {
      toast.success("Tip deleted.");
      void queryClient.invalidateQueries({ queryKey: ["tips"] });
    },
    onError: (error) =>
      toast.error(
        isApiError(error) && error.code === "NETWORK"
          ? "Deleting needs the backend — not connected yet."
          : "Could not delete tip."
      ),
  });

  const columns = useMemo<ColumnDef<Tip>[]>(
    () => [
      {
        accessorKey: "body",
        header: "Tip",
        cell: ({ row }) => <span className="line-clamp-2 max-w-md">{row.original.body}</span>,
      },
      {
        accessorKey: "mood",
        header: "Mood",
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
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "success" : "secondary"}>
            {row.original.isActive ? "Active" : "Hidden"}
          </Badge>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.updatedAt)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Tip actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingTip(row.original);
                  setDialogOpen(true);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("Delete this tip?")) deleteMutation.mutate(row.original.id);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [deleteMutation]
  );

  return (
    <div>
      <PageHeader
        title="Content"
        description="The daily “Thrivo Tips” bank."
        actions={
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
        }
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        emptyMessage="No tips yet."
        pagination={{
          currentPage: data?.pagination.page ?? page,
          totalPages: data?.pagination.totalPages ?? 1,
          onPageChange: setPage,
        }}
      />

      <TipDialog open={dialogOpen} onOpenChange={setDialogOpen} tip={editingTip} />
    </div>
  );
}
