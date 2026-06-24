"use client";

import { type ReactNode } from "react";
import {
  type ColumnDef,
  type RowData,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "./TablePagination";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    width?: string;
    align?: "left" | "center" | "right";
    headerClassName?: string;
    cellClassName?: string;
  }
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

export const DEFAULT_PAGE_SIZE = 12;

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  emptyMessage?: ReactNode;
  emptyState?: ReactNode;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  renderMobileCard?: (row: TData, onClick?: () => void) => ReactNode;
  toolbar?: ReactNode;
  className?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

/**
 * TanStack Table wrapper: desktop fixed-layout with horizontal scroll; mobile cards
 * when `renderMobileCard` is provided. Optional toolbar and pagination.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found.",
  emptyState,
  onRowClick,
  getRowId,
  renderMobileCard,
  toolbar,
  className,
  pagination,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
  });

  const rows = table.getRowModel().rows;
  const isEmpty = !loading && data.length === 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {toolbar}

      {loading ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border bg-muted/60 p-4">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed py-12">
          {emptyState ?? <p className="text-sm text-muted-foreground">{emptyMessage}</p>}
        </div>
      ) : isMobile && renderMobileCard ? (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.id}>
              {renderMobileCard(
                row.original,
                onRowClick ? () => onRowClick(row.original) : undefined
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="sleek-scrollbar overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] table-fixed caption-bottom text-sm">
            <thead className="bg-muted/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border">
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta;
                    return (
                      <th
                        key={header.id}
                        style={meta?.width ? { width: meta.width } : undefined}
                        className={cn(
                          "h-10 px-4 text-left align-middle font-medium text-muted-foreground",
                          meta?.align && alignClass[meta.align],
                          meta?.headerClassName
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    "border-b border-border transition-colors last:border-0 hover:bg-muted/50",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta;
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-4 py-2.5 align-middle",
                          meta?.align && alignClass[meta.align],
                          meta?.cellClassName
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && !loading && !isEmpty ? (
        <TablePagination {...pagination} />
      ) : null}
    </div>
  );
}
