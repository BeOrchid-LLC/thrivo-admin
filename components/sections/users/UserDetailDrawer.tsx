"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingState, ErrorState } from "@/components/general/states";
import type { AdminUser } from "@/lib/contracts";
import { userDetailQuery } from "./UserDetailSection";
import { ActivityCard, ProfileCard, SubscriptionCard } from "./UserProfileCards";

interface UserDetailDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function UserDetailDrawer({ user, onClose, onDeleted }: UserDetailDrawerProps) {
  return (
    <Sheet
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="overflow-y-auto">
        {user && <DrawerBody userId={user.id} userEmail={user.email} onDeleted={onDeleted} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  userId,
  userEmail,
  onDeleted,
}: {
  userId: string;
  userEmail: string;
  onDeleted: () => void;
}) {
  const { data, isLoading, isError, refetch } = useQuery(userDetailQuery(userId));

  const user = data?.user;

  if (isLoading) {
    return (
      <>
        <SheetHeader>
          <SheetTitle>{userEmail}</SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <LoadingState message="Loading user…" />
        </div>
      </>
    );
  }

  if (isError || !user) {
    return (
      <>
        <SheetHeader>
          <SheetTitle>{userEmail}</SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <ErrorState onRetry={() => refetch()} />
        </div>
      </>
    );
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{user.name ?? user.email}</SheetTitle>
        <SheetDescription>{user.email}</SheetDescription>
      </SheetHeader>

      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <ProfileCard user={user} />
        <ActivityCard user={user} />
        <SubscriptionCard user={user} />
      </div>

      <div className="border-t px-6 py-4">
        <HardDeleteDialog userId={userId} userEmail={user.email} onDeleted={onDeleted} />
      </div>
    </>
  );
}

function HardDeleteDialog({
  userId,
  userEmail,
  onDeleted,
}: {
  userId: string;
  userEmail: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => callApi("DELETE_USER", { params: { id: userId } }),
    onSuccess: () => {
      toast.success(`${userEmail} deleted permanently.`);
      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full gap-2">
          <Trash2 className="h-4 w-4" />
          Delete user permanently
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete user?</DialogTitle>
          <DialogDescription>
            This removes <strong>{userEmail}</strong> and all their data (food logs, sessions,
            weight entries). This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deleting…" : "Yes, delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
