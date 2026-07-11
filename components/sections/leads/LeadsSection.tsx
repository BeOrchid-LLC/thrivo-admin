"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw, Search } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys, type ListParams } from "@/lib/api";
import { env } from "@/lib/config/env";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import { useCursorPagination } from "@/lib/hooks/useCursorPagination";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { LeadHardDeleteDialog, useLeadDeleteDialog } from "./LeadHardDeleteDialog";
import { LeadsTable } from "./LeadsTable";
import type { Lead } from "@/lib/contracts";

export function LeadsSection() {
  const queryClient = useQueryClient();
  const { filters, isPending, searchInput, setSearchInput } = useUrlListFilters();
  const pagination = useCursorPagination();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [exporting, setExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const deleteDialog = useLeadDeleteDialog();

  // See UsersSection's identical effect — a search change invalidates every
  // cursor collected under the old query.
  useEffect(() => {
    pagination.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  const params: ListParams = {
    cursor: pagination.cursor,
    limit: DEFAULT_PAGE_SIZE,
    search: filters.q,
  };

  const listQueryKey = queryKeys.leads.list(params);
  const isFetchingLeads = useIsFetching({ queryKey: listQueryKey }) > 0;

  const refreshLeads = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: queryKeys.leads.list({}), exact: false });
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportLeads = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${env.apiUrl}${env.apiPrefix}/admin/leads/export`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Export request failed with status ${res.status}`);
      const blob = await res.blob();
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);
      anchor.download = "leads.csv";
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    } catch {
      toast.error("Export failed — backend may not be connected yet.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleted = () => {
    deleteDialog.clearDelete();
    setSelectedLead(null);
  };

  const boundaryKey = `${pagination.pageNumber}-${params.search}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Email captures from the public site's launch-notification CTA."
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh leads"
                disabled={isRefreshing || isFetchingLeads}
                onClick={() => void refreshLeads()}
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh leads</TooltipContent>
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void exportLeads()}
            disabled={exporting}
            className="shrink-0"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>

      <div className={cn(isPending && "opacity-60 transition-opacity")}>
        <QueryBoundary
          key={boundaryKey}
          fallback={<TableContentSkeleton />}
          errorMessage="Could not load leads."
        >
          <LeadsTable
            params={params}
            onRowClick={setSelectedLead}
            onDelete={deleteDialog.requestDelete}
            pageNumber={pagination.pageNumber}
            hasPrev={pagination.hasPrev}
            onNext={pagination.goNext}
            onPrev={pagination.goPrev}
          />
        </QueryBoundary>
      </div>

      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onDelete={deleteDialog.requestDelete}
      />

      <LeadHardDeleteDialog
        lead={deleteDialog.deleteTarget}
        open={deleteDialog.isOpen}
        onOpenChange={deleteDialog.setOpen}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
