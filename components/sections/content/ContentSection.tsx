"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type EndpointResponse, type ListParams } from "@/lib/api";
import { env } from "@/lib/config/env";
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
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { TipDialog } from "./TipDialog";

type TipListParams = ListParams & {
  mood?: string;
  active?: boolean;
  pinnedFrom?: string;
  pinnedTo?: string;
};

export function tipsListQuery(params: TipListParams) {
  const fixtureItems = fixtureTipsPage.items.filter((tip) => {
    const moodMatches =
      !params.mood || (params.mood === "ok" ? tip.mood === "okay" : tip.mood === params.mood);
    const activeMatches = params.active === undefined || tip.isActive === params.active;
    const fromMatches =
      !params.pinnedFrom || (tip.pinnedDate !== null && tip.pinnedDate >= params.pinnedFrom);
    const toMatches =
      !params.pinnedTo || (tip.pinnedDate !== null && tip.pinnedDate <= params.pinnedTo);
    return moodMatches && activeMatches && fromMatches && toMatches;
  });
  return {
    queryKey: queryKeys.tips.list(params),
    queryFn: () =>
      resolveData(
        {
          items: fixtureItems,
          pagination: {
            ...fixtureTipsPage.pagination,
            total: fixtureItems.length,
            totalPages: Math.max(
              1,
              Math.ceil(fixtureItems.length / (params.pageSize ?? DEFAULT_PAGE_SIZE))
            ),
          },
        },
        () =>
          callApi("LIST_TIPS", {
            query: {
              page: params.page,
              pageSize: params.pageSize,
              mood: params.mood,
              active: params.active,
              pinnedFrom: params.pinnedFrom,
              pinnedTo: params.pinnedTo,
            },
          })
      ),
  };
}

function ContentTipsTable({
  page,
  onPageChange,
  onEdit,
  onDelete,
  onDuplicate,
  canManage,
  filters,
}: {
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (tip: Tip) => void;
  onDelete: (tip: Tip) => void;
  onDuplicate: (tip: Tip) => void;
  canManage: boolean;
  filters: TipListParams;
}) {
  const { data } = useSuspenseQuery(
    tipsListQuery({ ...filters, page, pageSize: DEFAULT_PAGE_SIZE })
  );

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
                    <DropdownMenuItem onClick={() => onDuplicate(row.original)}>
                      Duplicate as draft
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/audit?kind=tip&targetId=${encodeURIComponent(row.original.id)}`}
                      >
                        View audit history
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            } satisfies ColumnDef<Tip>,
          ]
        : []),
    ],
    [onDelete, onEdit, onDuplicate, canManage]
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
  const [mood, setMood] = useState("all");
  const [active, setActive] = useState("all");
  const [pinnedFrom, setPinnedFrom] = useState("");
  const [pinnedTo, setPinnedTo] = useState("");
  const tipFilters: TipListParams = {
    mood: mood === "all" ? undefined : mood,
    active: active === "all" ? undefined : active === "active",
    pinnedFrom: pinnedFrom || undefined,
    pinnedTo: pinnedTo || undefined,
  };
  const duplicateMutation = useMutation({
    mutationFn: (source: Tip) => {
      if (env.useFixtures) {
        return Promise.resolve({
          tip: {
            ...source,
            id: `fixture-tip-${Date.now()}`,
            isActive: false,
            pinnedDate: null,
            updatedAt: new Date().toISOString(),
          },
        });
      }
      return callApi("DUPLICATE_TIP", {
        params: { id: source.id },
        payload: { confirmation: "DUPLICATE" },
      });
    },
    onSuccess: (result) => {
      if (env.useFixtures) {
        queryClient.setQueriesData<EndpointResponse<"LIST_TIPS">>(
          { queryKey: ["tips", "list"] },
          (data) =>
            data
              ? {
                  ...data,
                  items: [result.tip, ...data.items],
                  pagination: { ...data.pagination, total: data.pagination.total + 1 },
                }
              : data
        );
      }
      toast.success("Draft created from tip.");
      if (!env.useFixtures)
        void queryClient.invalidateQueries({ queryKey: ["tips"], exact: false });
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Could not duplicate tip."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      env.useFixtures ? Promise.resolve({}) : callApi("DELETE_TIP", { params: { id } }),
    onSuccess: () => {
      toast.success("Tip deleted.");
      if (env.useFixtures) {
        queryClient.setQueriesData<EndpointResponse<"LIST_TIPS">>(
          { queryKey: queryKeys.tips.list({}), exact: false },
          (data) =>
            data
              ? {
                  ...data,
                  items: data.items.filter((item) => item.id !== deletingTip?.id),
                  pagination: {
                    ...data.pagination,
                    total: Math.max(0, data.pagination.total - 1),
                  },
                }
              : data
        );
      } else {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.tips.list({ page: 1, pageSize: DEFAULT_PAGE_SIZE }),
          exact: false,
        });
      }
    },
    onError: (error) =>
      toast.error(
        isApiError(error) && error.code === "NETWORK"
          ? "Deleting failed because the live API is unavailable."
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

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={mood}
          onValueChange={(value) => {
            setMood(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All moods</SelectItem>
            <SelectItem value="great">Great</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="ok">Okay</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="bad">Bad</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={active}
          onValueChange={(value) => {
            setActive(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All visibility</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          aria-label="Pinned from"
          value={pinnedFrom}
          onChange={(event) => {
            setPinnedFrom(event.target.value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          aria-label="Pinned through"
          value={pinnedTo}
          onChange={(event) => {
            setPinnedTo(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <QueryBoundary
        key={`${page}-${mood}-${active}-${pinnedFrom}-${pinnedTo}`}
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
          onDuplicate={(tip) => duplicateMutation.mutate(tip)}
          canManage={canManageContent}
          filters={tipFilters}
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
