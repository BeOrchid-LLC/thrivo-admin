"use client";

import { useEffect, useState } from "react";
import { Download, RefreshCw, Search } from "lucide-react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { downloadApi, queryKeys, type ListParams } from "@/lib/api";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { useUrlListFilters } from "@/lib/hooks/useUrlListFilters";
import { useCursorPagination } from "@/lib/hooks/useCursorPagination";
import { useCapability } from "@/lib/hooks/useCapability";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { LeadHardDeleteDialog, useLeadDeleteDialog } from "./LeadHardDeleteDialog";
import { LeadsTable } from "./LeadsTable";
import type { Lead } from "@/lib/contracts";

export function LeadsSection() {
  const queryClient = useQueryClient();
  const { canManageLeads } = useCapability();
  const {
    filters,
    isPending,
    searchInput,
    setSearchInput,
    setStatus,
    setKind,
    setOwner,
    setReconciled,
    setFrom,
    setTo,
  } = useUrlListFilters();
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
  }, [
    filters.q,
    filters.status,
    filters.kind,
    filters.owner,
    filters.reconciled,
    filters.from,
    filters.to,
  ]);

  const params: ListParams = {
    cursor: pagination.cursor,
    limit: DEFAULT_PAGE_SIZE,
    search: filters.q,
    status: filters.status,
    kind: filters.kind,
    owner: filters.owner || undefined,
    reconciled: filters.reconciled,
    from: filters.from || undefined,
    to: filters.to || undefined,
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
      const exportQuery = new URLSearchParams();
      if (params.search) exportQuery.set("search", params.search);
      if (params.status && params.status !== "all") exportQuery.set("status", params.status);
      if (params.kind && params.kind !== "all") exportQuery.set("source", params.kind);
      if (params.owner) exportQuery.set("owner", params.owner);
      if (params.reconciled && params.reconciled !== "all")
        exportQuery.set("reconciled", params.reconciled);
      if (params.from) exportQuery.set("from", params.from);
      if (params.to) exportQuery.set("to", params.to);
      const blob = await downloadApi("EXPORT_LEADS", { query: Object.fromEntries(exportQuery) });
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

  const boundaryKey = `${pagination.pageNumber}-${params.search}-${params.status}-${params.kind}-${params.owner}-${params.reconciled}-${params.from}-${params.to}`;

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
            <Select value={filters.status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Lead status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["new", "contacted", "qualified", "converted", "unsubscribed", "spam"].map(
                  (value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Select value={filters.kind} onValueChange={setKind}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                <SelectItem value="cta">CTA</SelectItem>
                <SelectItem value="landing">Landing</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Owner email…"
              value={filters.owner}
              onChange={(event) => setOwner(event.target.value)}
              className="w-full sm:w-44"
            />
            <Select value={filters.reconciled} onValueChange={setReconciled}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Reconciliation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All links</SelectItem>
                <SelectItem value="true">Linked</SelectItem>
                <SelectItem value="false">Unlinked</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              aria-label="Captured from"
              value={filters.from.slice(0, 10)}
              onChange={(event) =>
                setFrom(event.target.value ? `${event.target.value}T00:00:00.000Z` : "")
              }
              className="w-full sm:w-40"
            />
            <Input
              type="date"
              aria-label="Captured through"
              value={filters.to.slice(0, 10)}
              onChange={(event) =>
                setTo(event.target.value ? `${event.target.value}T23:59:59.999Z` : "")
              }
              className="w-full sm:w-40"
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
            onDelete={canManageLeads ? deleteDialog.requestDelete : undefined}
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
