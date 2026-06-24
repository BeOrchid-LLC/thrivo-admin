"use client";

import { Download, RefreshCw, Search } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type ListParams } from "@/lib/api";
import { env } from "@/lib/config/env";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { UserHardDeleteDialog, useUserDeleteDialog } from "./UserHardDeleteDialog";
import { UsersTable } from "./UsersTable";
import type { AdminUser } from "@/lib/contracts";
import { useState } from "react";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export function UsersSection() {
  const queryClient = useQueryClient();
  const { filters, isPending, searchInput, setSearchInput, setStatus, setPage } =
    useUrlListFilters();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const deleteDialog = useUserDeleteDialog();

  const params: ListParams = {
    page: filters.page,
    pageSize: DEFAULT_PAGE_SIZE,
    search: filters.q,
    status: filters.status,
  };

  const listQueryKey = queryKeys.users.list(params);
  const isFetchingUsers = useIsFetching({ queryKey: listQueryKey }) > 0;

  const refreshUsers = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.list({}), exact: false });
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportUsers = async () => {
    setExporting(true);
    try {
      const { url } = await callApi("EXPORT_USERS");
      const exportOrigin = new URL(url).origin;
      const apiOrigin = new URL(env.apiUrl).origin;
      if (exportOrigin !== apiOrigin) {
        toast.error("Export URL origin mismatch — aborting.");
        return;
      }
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Export request failed with status ${res.status}`);
      const blob = await res.blob();
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);
      anchor.download = "users.csv";
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    } catch (error) {
      if (isApiError(error) && error.code === "NETWORK") {
        toast.error("Export needs the backend — not connected yet.");
      } else {
        toast.error("Export failed.");
      }
    } finally {
      setExporting(false);
    }
  };

  const handleDeleted = () => {
    deleteDialog.clearDelete();
    setSelectedUser(null);
  };

  const boundaryKey = `${params.page}-${params.search}-${params.status}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Search, inspect and support user accounts." />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={filters.status} onValueChange={setStatus}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-1">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-md lg:flex-none">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Refresh users"
                  disabled={isRefreshing || isFetchingUsers}
                  onClick={() => void refreshUsers()}
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh users</TooltipContent>
            </Tooltip>
            <Button
              variant="outline"
              size="sm"
              onClick={exportUsers}
              disabled={exporting}
              className="shrink-0"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exporting…" : "Export CSV"}
            </Button>
          </div>
        </div>
      </div>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={boundaryKey}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load users."
        >
          <UsersTable
            params={params}
            onRowClick={setSelectedUser}
            onDelete={deleteDialog.requestDelete}
            onPageChange={setPage}
          />
        </QueryBoundary>
      </div>

      <UserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onDelete={deleteDialog.requestDelete}
      />

      <UserHardDeleteDialog
        user={deleteDialog.deleteTarget}
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.setOpen}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
