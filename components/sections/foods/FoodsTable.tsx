"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BadgeCheck, ExternalLink, ScrollText } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { resolveData } from "@/lib/fixtures";
import { fixtureFoods } from "@/lib/fixtures/ops";
import { DataTable } from "@/components/general/DataTable";
import { ActionsMenu } from "@/components/general/ActionsMenu";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import type { FoodItemRow } from "@/lib/contracts";

type FoodListParams = ListParams & { tier?: string; origin?: string };

export function foodsListQuery(params: FoodListParams) {
  return {
    queryKey: queryKeys.foods.list(params),
    queryFn: () =>
      resolveData(fixtureFoods, () =>
        callApi("LIST_FOODS", {
          query: {
            cursor: params.cursor,
            limit: params.limit,
            status: params.status || undefined,
            tier: params.tier || undefined,
            origin: params.origin || undefined,
            search: params.search || undefined,
          },
        })
      ),
  };
}

const STATUS_VARIANT: Record<string, "success" | "secondary" | "destructive"> = {
  active: "success",
  pending: "secondary",
  rejected: "destructive",
  merged: "secondary",
};

interface FoodsTableProps {
  params: FoodListParams;
  onRowClick: (food: FoodItemRow) => void;
  pageNumber: number;
  hasPrev: boolean;
  onNext: (nextCursor: string | null) => void;
  onPrev: () => void;
}

/** Catalog moderation table — suspense-fetched; wrapped in QueryBoundary by the parent. */
export function FoodsTable({
  params,
  onRowClick,
  pageNumber,
  hasPrev,
  onNext,
  onPrev,
}: FoodsTableProps) {
  const { data } = useSuspenseQuery(foodsListQuery(params));

  const columns = useMemo<ColumnDef<FoodItemRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Item",
        meta: { width: "34%" },
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Link
              href={`/foods/${row.original.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium underline-offset-2 hover:underline"
            >
              {row.original.name}
            </Link>
            {row.original.verifiedAt ? (
              <BadgeCheck
                className="h-3.5 w-3.5 text-[var(--brand,#27AE60)]"
                aria-label="Verified"
              />
            ) : null}
            {row.original.brand ? (
              <span className="text-xs text-muted-foreground">· {row.original.brand}</span>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "tier",
        header: "Tier",
        meta: { width: "12%" },
        cell: ({ row }) => <Badge variant="secondary">{row.original.tier}</Badge>,
      },
      {
        accessorKey: "status",
        header: "Status",
        meta: { width: "12%" },
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "secondary"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "origin",
        header: "Origin",
        meta: { width: "14%" },
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.origin}</span>,
      },
      {
        accessorKey: "logCount",
        header: "Logs",
        meta: { width: "8%", align: "right" },
        cell: ({ row }) => <span className="tabular-nums">{row.original.logCount}</span>,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        meta: { width: "16%" },
        cell: ({ row }) => (
          <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        meta: { width: "4rem", align: "right" },
        cell: ({ row }) => (
          <div
            className="flex justify-end"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <ActionsMenu
              ariaLabel={`Actions for ${row.original.name}`}
              options={[
                {
                  label: "View details",
                  icon: ExternalLink,
                  onClick: () => onRowClick(row.original),
                },
                {
                  label: "View audit history",
                  icon: ScrollText,
                  onClick: () => {
                    window.location.href = `/audit?kind=food_item&targetId=${encodeURIComponent(row.original.id)}`;
                  },
                },
              ]}
            />
          </div>
        ),
      },
    ],
    [onRowClick]
  );

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No catalog items match these filters."
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      cursorPagination={{
        pageNumber,
        hasPrev,
        hasNext: data.pagination.nextCursor !== null,
        onNext: () => onNext(data.pagination.nextCursor),
        onPrev,
      }}
    />
  );
}
