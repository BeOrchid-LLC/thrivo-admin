"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type EndpointResponse } from "@/lib/api";
import { env } from "@/lib/config/env";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Lead } from "@/lib/contracts";

interface LeadHardDeleteDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function LeadHardDeleteDialog({
  lead,
  open,
  onOpenChange,
  onDeleted,
}: LeadHardDeleteDialogProps) {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: (leadId: string) =>
      env.useFixtures ? Promise.resolve({}) : callApi("DELETE_LEAD", { params: { id: leadId } }),
    onSuccess: () => {
      toast.success(`${lead?.email} deleted.`);
      setConfirm("");
      onOpenChange(false);
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_LEADS">>(
          { queryKey: queryKeys.leads.list({}), exact: false },
          (data) =>
            data
              ? {
                  ...data,
                  items: data.items.filter((item) => item.id !== lead?.id),
                  pagination: { ...data.pagination, total: Math.max(0, data.pagination.total - 1) },
                }
              : data
        );
      } else {
        void qc.invalidateQueries({ queryKey: queryKeys.leads.list({}), exact: false });
      }
      onDeleted();
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "NETWORK") {
        toast.error("Delete failed because the live API is unavailable.");
      } else {
        toast.error(isApiError(error) ? error.message : "Delete failed.");
      }
    },
  });

  if (!lead) return null;

  const confirmed = confirm === lead.email;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setConfirm("");
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete this lead?</DialogTitle>
          <DialogDescription>
            This removes <strong>{lead.email}</strong> from the capture list. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="lead-delete-confirm">
            Type <strong>{lead.email}</strong> to confirm
          </Label>
          <Input
            id="lead-delete-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={lead.email}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate(lead.id)}
            disabled={!confirmed || mutation.isPending}
          >
            {mutation.isPending ? "Deleting…" : "Yes, delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Controlled delete dialog opened from row or drawer actions menus. */
export function useLeadDeleteDialog() {
  const [target, setTarget] = useState<Lead | null>(null);

  return {
    deleteTarget: target,
    requestDelete: (lead: Lead) => setTarget(lead),
    clearDelete: () => setTarget(null),
    isOpen: target !== null,
    setOpen: (open: boolean) => {
      if (!open) setTarget(null);
    },
  };
}
