"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { fixtureLeadsPage, resolveData } from "@/lib/fixtures";
import { DataTable } from "@/components/general/DataTable";
import { makeLeadColumns } from "./columns";
import type { Lead } from "@/lib/contracts";
import type { ColumnDef } from "@tanstack/react-table";

export function leadsListQuery(params: ListParams) {
  return {
    queryKey: queryKeys.leads.list(params),
    queryFn: () =>
      resolveData(fixtureLeadsPage, () =>
        callApi("LIST_LEADS", {
          query: {
            cursor: params.cursor,
            limit: params.limit,
            search: params.search || undefined,
          },
        })
      ),
  };
}

interface LeadsTableProps {
  params: ListParams;
  onRowClick: (lead: Lead) => void;
  /** Omitted for roles without delete permission — the column hides the action. */
  onDelete?: (lead: Lead) => void;
  pageNumber: number;
  hasPrev: boolean;
  onNext: (nextCursor: string | null) => void;
  onPrev: () => void;
}

/** Leads list table — suspense-fetched; wrapped in QueryBoundary by the parent. */
export function LeadsTable({
  params,
  onRowClick,
  onDelete,
  pageNumber,
  hasPrev,
  onNext,
  onPrev,
}: LeadsTableProps) {
  const { data } = useSuspenseQuery(leadsListQuery(params));
  const columns = makeLeadColumns({ onDelete }) as ColumnDef<Lead>[];

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No leads match these filters."
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
