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
import type { AdminUser } from "@/lib/contracts";

interface UserHardDeleteDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function UserHardDeleteDialog({
  user,
  open,
  onOpenChange,
  onDeleted,
}: UserHardDeleteDialogProps) {
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (userId: string) => callApi("DELETE_USER", { params: { id: userId } }),
    onSuccess: () => {
      toast.success(`${user?.email} deleted permanently.`);
      onOpenChange(false);
      void qc.invalidateQueries({ queryKey: queryKeys.users.list({}), exact: false });
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

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete user?</DialogTitle>
          <DialogDescription>
            This removes <strong>{user.email}</strong> and all their data (food logs, sessions,
            weight entries). This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate(user.id)}
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
export function useUserDeleteDialog() {
  const [target, setTarget] = useState<AdminUser | null>(null);

  return {
    deleteTarget: target,
    requestDelete: (user: AdminUser) => setTarget(user),
    clearDelete: () => setTarget(null),
    isOpen: target !== null,
    setOpen: (open: boolean) => {
      if (!open) setTarget(null);
    },
  };
}
