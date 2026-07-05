"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const mutation = useMutation({
    mutationFn: (leadId: string) => callApi("DELETE_LEAD", { params: { id: leadId } }),
    onSuccess: () => {
      toast.success(`${lead?.email} deleted.`);
      onOpenChange(false);
      void qc.invalidateQueries({ queryKey: queryKeys.leads.list({}), exact: false });
      onDeleted();
    },
    onError: (error) => {
      if (isApiError(error) && error.code === "NETWORK") {
        toast.error("Backend not connected — delete needs the live API.");
      } else {
        toast.error(isApiError(error) ? error.message : "Delete failed.");
      }
    },
  });

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete this lead?</DialogTitle>
          <DialogDescription>
            This removes <strong>{lead.email}</strong> from the capture list. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate(lead.id)}
            disabled={mutation.isPending}
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
