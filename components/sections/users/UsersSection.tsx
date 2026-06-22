"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type ListParams } from "@/lib/api";
import { fixtureUsersPage, resolveData } from "@/lib/fixtures";
import { PageHeader } from "@/components/general/PageHeader";
import { FilterableDataPage } from "@/components/general/FilterableDataPage";
import { Button } from "@/components/ui/button";
import { makeUserColumns } from "./columns";
import { UserDetailDrawer } from "./UserDetailDrawer";
import type { AdminUser } from "@/lib/contracts";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
];

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

export function UsersSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const params: ListParams = { page, pageSize: 12, search, status };
  const { data, isLoading, isError, refetch } = useQuery(usersListQuery(params));

  const handleDelete = (user: AdminUser) => {
    // Pre-select so the drawer opens with the user to confirm deletion
    setSelectedUser(user);
  };

  const exportUsers = async () => {
    try {
      const { url } = await callApi("EXPORT_USERS");
      window.open(url, "_blank");
    } catch (error) {
      if (isApiError(error) && error.code === "NETWORK") {
        toast.error("Export needs the backend — not connected yet.");
      } else {
        toast.error("Export failed.");
      }
    }
  };

  const columns = makeUserColumns(handleDelete);

  return (
    <div>
      <PageHeader title="Users" description="Search, inspect and support user accounts." />
      <FilterableDataPage
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        error={isError}
        onRetry={() => refetch()}
        emptyMessage="No users match these filters."
        onRowClick={(u) => setSelectedUser(u)}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by email or name…"
        statusOptions={statusOptions}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        pagination={{
          currentPage: data?.pagination.page ?? page,
          totalPages: data?.pagination.totalPages ?? 1,
          onPageChange: setPage,
        }}
        headerActions={
          <Button variant="outline" size="sm" onClick={exportUsers}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onDeleted={() => {
          setSelectedUser(null);
          void refetch();
        }}
      />
    </div>
  );
}
