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
  const [confirm, setConfirm] = useState("");

  const mutation = useMutation({
    mutationFn: (userId: string) =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("DELETE_USER", {
            params: { id: userId },
            query: { confirmationEmail: user?.email ?? "" },
          }),
    onSuccess: () => {
      toast.success(`${user?.email} erasure queued.`);
      setConfirm("");
      onOpenChange(false);
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_USERS">>(
          { queryKey: queryKeys.users.list({}), exact: false },
          (data) =>
            data
              ? {
                  ...data,
                  items: data.items.filter((item) => item.id !== user?.id),
                  pagination: { ...data.pagination, total: Math.max(0, data.pagination.total - 1) },
                }
              : data
        );
      } else {
        void qc.invalidateQueries({ queryKey: queryKeys.users.list({}), exact: false });
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

  if (!user) return null;

  const confirmed = confirm === user.email;

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
          <DialogTitle>Permanently delete user?</DialogTitle>
          <DialogDescription>
            This queues removal of <strong>{user.email}</strong> from Clerk, RevenueCat, R2, and the
            database. Store subscriptions are not cancelled; the customer must manage those in Apple
            or Google.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-confirm">
            Type <strong>{user.email}</strong> to confirm
          </Label>
          <Input
            id="delete-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={user.email}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate(user.id)}
            disabled={!confirmed || mutation.isPending}
          >
            {mutation.isPending ? "Queuing…" : "Delete permanently (queue erasure)"}
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
