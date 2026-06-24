"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { callApi, queryKeys, type ListParams } from "@/lib/api";
import { fixtureUsersPage, resolveData } from "@/lib/fixtures";
import { DataTable } from "@/components/general/DataTable";
import { makeUserColumns } from "./columns";
import { UserCard } from "./UserCard";
import type { AdminUser } from "@/lib/contracts";
import type { ColumnDef } from "@tanstack/react-table";

export function usersListQuery(params: ListParams) {
  return {
    queryKey: queryKeys.users.list(params),
    queryFn: () =>
      resolveData(fixtureUsersPage, () =>
        callApi("LIST_USERS", {
          query: {
            page: params.page,
            pageSize: params.pageSize,
            search: params.search || undefined,
            status: params.status && params.status !== "all" ? params.status : undefined,
          },
        })
      ),
  };
}

interface UsersTableProps {
  params: ListParams;
  onRowClick: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onPageChange: (page: number) => void;
}

/** Users list table — suspense-fetched; wrapped in QueryBoundary by the parent. */
export function UsersTable({ params, onRowClick, onDelete, onPageChange }: UsersTableProps) {
  const { data } = useSuspenseQuery(usersListQuery(params));
  const columns = makeUserColumns({ onDelete }) as ColumnDef<AdminUser>[];

  return (
    <DataTable
      columns={columns}
      data={data.items}
      emptyMessage="No users match these filters."
      onRowClick={onRowClick}
      getRowId={(row) => row.id}
      renderMobileCard={(user, onClick) => <UserCard user={user} onClick={onClick} />}
      pagination={{
        currentPage: data.pagination.page,
        totalPages: data.pagination.totalPages,
        onPageChange,
      }}
    />
  );
}
