"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "./DataTable";
import { ErrorState } from "./states";

export interface StatusOption {
  label: string;
  value: string;
}

export interface FilterableDataPageProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  emptyMessage?: ReactNode;
  onRowClick?: (row: TData) => void;
  pagination?: { currentPage: number; totalPages: number; onPageChange: (page: number) => void };

  // Toolbar
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  statusOptions?: StatusOption[];
  status?: string;
  onStatusChange?: (value: string) => void;
  headerActions?: ReactNode;
}

/**
 * Controlled search + status filter toolbar above a DataTable. The page owns the
 * filter/pagination state (and the data fetch); this component is presentational.
 */
export function FilterableDataPage<TData, TValue>({
  columns,
  data,
  loading,
  error,
  onRetry,
  emptyMessage,
  onRowClick,
  pagination,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  statusOptions,
  status,
  onStatusChange,
  headerActions,
}: FilterableDataPageProps<TData, TValue>) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {onSearchChange ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : null}

          {statusOptions && onStatusChange ? (
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>

        {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
      </div>

      {error ? (
        <ErrorState onRetry={onRetry} />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage={emptyMessage}
          onRowClick={onRowClick}
          pagination={pagination}
        />
      )}
    </div>
  );
}
