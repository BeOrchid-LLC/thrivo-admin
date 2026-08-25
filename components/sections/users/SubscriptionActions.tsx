"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type EndpointResponse } from "@/lib/api";
import { env } from "@/lib/config/env";
import {
  cancelPayload,
  refundPayload,
  type CancelPayload,
  type RefundPayload,
} from "@/lib/contracts";
import { useCapability } from "@/lib/hooks/useCapability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DetailResponse = EndpointResponse<"GET_USER">;

function useDetailUpdate(userId: string) {
  const qc = useQueryClient();
  return (update: (user: DetailResponse["user"]) => DetailResponse["user"]) => {
    if (env.useFixtures) {
      qc.setQueryData<DetailResponse>(queryKeys.users.detail(userId), (data) =>
        data ? { ...data, user: update(data.user) } : data
      );
    } else {
      void qc.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    }
  };
}

/** Admin-only: kick the (idempotent, global) subscription reconcile backstop. */
export function ReconcileButton({ userId }: { userId: string }) {
  const { canManageSubscriptions } = useCapability();
  const mutation = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("RECONCILE_SUBSCRIPTION", { params: { id: userId } }),
    onSuccess: () => toast.success("Reconcile enqueued."),
    onError: onMutationError,
  });
  if (!canManageSubscriptions) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      Reconcile
    </Button>
  );
}

function onMutationError(error: unknown) {
  if (isApiError(error) && error.code === "NETWORK") {
    toast.error("This action needs the backend — not connected yet.");
  } else {
    toast.error(isApiError(error) ? error.message : "Action failed.");
  }
}

/** Relocated into the Subscription Timeline card's footer (was the page
 *  header) — same CANCEL_SUBSCRIPTION mutation, unchanged. */
export function CancelDialog({ userId }: { userId: string }) {
  const { canManageSubscriptions } = useCapability();
  const updateDetail = useDetailUpdate(userId);
  const form = useForm<CancelPayload>({
    resolver: zodResolver(cancelPayload),
    defaultValues: { reason: "" },
  });
  const mutation = useMutation<DetailResponse, unknown, CancelPayload>({
    mutationFn: (payload) =>
      env.useFixtures
        ? Promise.resolve({} as DetailResponse)
        : callApi("CANCEL_SUBSCRIPTION", { params: { id: userId }, payload }),
    onSuccess: () => {
      toast.success("Subscription canceled.");
      updateDetail((user) => ({
        ...user,
        subscription: null,
        tier: "free",
        accountStatus: "free_plan",
      }));
    },
    onError: onMutationError,
  });

  // Money-adjacent — admin only. Backend also enforces this (403 otherwise).
  if (!canManageSubscriptions) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Cancel subscription
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel subscription</DialogTitle>
          <DialogDescription>This is audited. Provide a reason for the record.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Input
              id="cancel-reason"
              {...form.register("reason")}
              placeholder="e.g. support request"
            />
            {form.formState.errors.reason ? (
              <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={mutation.isPending}>
              Confirm cancellation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Relocated into the Subscription card, inline next to "First charge" (was
 *  the page header) — same REFUND_SUBSCRIPTION mutation, unchanged. */
export function RefundDialog({ userId }: { userId: string }) {
  const { canManageSubscriptions } = useCapability();
  const updateDetail = useDetailUpdate(userId);
  const form = useForm<RefundPayload>({
    resolver: zodResolver(refundPayload),
    defaultValues: { reason: "" },
  });
  const mutation = useMutation<DetailResponse, unknown, RefundPayload>({
    mutationFn: (payload) =>
      env.useFixtures
        ? Promise.resolve({} as DetailResponse)
        : callApi("REFUND_SUBSCRIPTION", { params: { id: userId }, payload }),
    onSuccess: () => {
      toast.success("Refund issued.");
      updateDetail((user) => ({ ...user }));
    },
    onError: onMutationError,
  });

  // Money-adjacent — admin only. Backend also enforces this (403 otherwise).
  if (!canManageSubscriptions) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Refund
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue refund</DialogTitle>
          <DialogDescription>
            Audited action. Amount optional (defaults to last charge).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="refund-reason">Reason</Label>
            <Input
              id="refund-reason"
              {...form.register("reason")}
              placeholder="e.g. duplicate charge"
            />
            {form.formState.errors.reason ? (
              <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              Issue refund
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
