"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type EndpointResponse } from "@/lib/api";
import { fixtureUserDetail, resolveData } from "@/lib/fixtures";
import {
  cancelPayload,
  refundPayload,
  type CancelPayload,
  type RefundPayload,
} from "@/lib/contracts";
import { PageHeader } from "@/components/general/PageHeader";
import { LoadingState, ErrorState } from "@/components/general/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { formatDate, formatNumber } from "@/lib/format";

export function userDetailQuery(id: string) {
  return {
    queryKey: queryKeys.users.detail(id),
    queryFn: () =>
      resolveData({ user: fixtureUserDetail }, () => callApi("GET_USER", { params: { id } })),
  };
}

type DetailResponse = EndpointResponse<"GET_USER">;

export function UserDetailSection({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useQuery(userDetailQuery(id));
  const user = data?.user;

  if (isLoading) return <LoadingState message="Loading user…" />;
  if (isError || !user) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div>
      <Link
        href="/users"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <PageHeader
        title={user.name ?? user.email}
        description={user.email}
        actions={
          <div className="flex gap-2">
            <CancelDialog userId={id} />
            <RefundDialog userId={id} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Tier" value={<Badge>{user.entitlement}</Badge>} />
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
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Food logs" value={formatNumber(user.totalFoodLogs)} />
            <Row label="Current streak" value={`${user.currentStreakDays} days`} />
            <Row label="Last active" value={formatDate(user.lastActiveAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {user.subscription ? (
              <>
                <Row label="Status" value={user.subscription.status} />
                <Row label="Price" value={user.subscription.priceLabel ?? "—"} />
                <Row label="Renews" value={formatDate(user.subscription.renewsAt)} />
                <Row
                  label="Cancels at period end"
                  value={user.subscription.cancelAtPeriodEnd ? "Yes" : "No"}
                />
              </>
            ) : (
              <p className="text-muted-foreground">No subscription.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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

function useDetailInvalidate(userId: string) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
}

function onMutationError(error: unknown) {
  if (isApiError(error) && error.code === "NETWORK") {
    toast.error("This action needs the backend — not connected yet.");
  } else {
    toast.error(isApiError(error) ? error.message : "Action failed.");
  }
}

function CancelDialog({ userId }: { userId: string }) {
  const invalidate = useDetailInvalidate(userId);
  const form = useForm<CancelPayload>({
    resolver: zodResolver(cancelPayload),
    defaultValues: { reason: "" },
  });
  const mutation = useMutation<DetailResponse, unknown, CancelPayload>({
    mutationFn: (payload) => callApi("CANCEL_SUBSCRIPTION", { params: { id: userId }, payload }),
    onSuccess: () => {
      toast.success("Subscription canceled.");
      void invalidate();
    },
    onError: onMutationError,
  });

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

function RefundDialog({ userId }: { userId: string }) {
  const invalidate = useDetailInvalidate(userId);
  const form = useForm<RefundPayload>({
    resolver: zodResolver(refundPayload),
    defaultValues: { reason: "" },
  });
  const mutation = useMutation<DetailResponse, unknown, RefundPayload>({
    mutationFn: (payload) => callApi("REFUND_SUBSCRIPTION", { params: { id: userId }, payload }),
    onSuccess: () => {
      toast.success("Refund issued.");
      void invalidate();
    },
    onError: onMutationError,
  });

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
