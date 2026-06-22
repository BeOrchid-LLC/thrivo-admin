"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import { fixtureUserDetail, resolveData } from "@/lib/fixtures";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatNumber } from "@/lib/format";
import { LoadingState, ErrorState } from "@/components/general/states";
import type { AdminUser } from "@/lib/contracts";

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
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () =>
      resolveData({ user: fixtureUserDetail }, () =>
        callApi("GET_USER", { params: { id: userId } })
      ),
  });

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row
              label="Tier"
              value={
                <Badge variant={user.entitlement === "premium" ? "default" : "secondary"}>
                  {user.entitlement}
                </Badge>
              }
            />
            <Row label="Status" value={user.status} />
            <Row label="Goal" value={user.goal ?? "—"} />
            <Row
              label="Target calories"
              value={user.targetCalories ? formatNumber(user.targetCalories) : "—"}
            />
            <Row label="Joined" value={formatDate(user.createdAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Food logs" value={formatNumber(user.totalFoodLogs)} />
            <Row label="Current streak" value={`${user.currentStreakDays} days`} />
            <Row label="Last active" value={formatDate(user.lastActiveAt)} />
          </CardContent>
        </Card>

        {user.subscription && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Status" value={user.subscription.status} />
              <Row label="Price" value={user.subscription.priceLabel ?? "—"} />
              <Row label="Renews" value={formatDate(user.subscription.renewsAt)} />
              <Row
                label="Cancels at period end"
                value={user.subscription.cancelAtPeriodEnd ? "Yes" : "No"}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="border-t px-6 py-4">
        <HardDeleteDialog userId={userId} userEmail={user.email} onDeleted={onDeleted} />
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
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
  const [confirmEmail, setConfirmEmail] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => callApi("DELETE_USER", { params: { id: userId } }),
    onSuccess: () => {
      toast.success(`${userEmail} deleted permanently.`);
      setOpen(false);
      setConfirmEmail("");
      void qc.invalidateQueries({ queryKey: ["users"] });
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmEmail("");
      }}
    >
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
        <div className="space-y-1.5">
          <Label htmlFor="confirm-email">
            Type <strong>{userEmail}</strong> to confirm
          </Label>
          <Input
            id="confirm-email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder={userEmail}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || confirmEmail !== userEmail}
          >
            {mutation.isPending ? "Deleting…" : "Yes, delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
