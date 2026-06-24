"use client";

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { MetricCardsFallback } from "@/components/general/skeletons/MetricCardsFallback";
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
import { ActivityCard, OnboardingCard, ProfileCard, SubscriptionCard } from "./UserProfileCards";

export function userDetailQuery(id: string) {
  return {
    queryKey: queryKeys.users.detail(id),
    queryFn: () =>
      resolveData({ user: fixtureUserDetail }, () => callApi("GET_USER", { params: { id } })),
  };
}

type DetailResponse = EndpointResponse<"GET_USER">;

export function UserDetailSection({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      <QueryBoundary
        fallback={<MetricCardsFallback count={3} />}
        errorMessage="Could not load user details."
      >
        <UserDetailContent id={id} />
      </QueryBoundary>
    </div>
  );
}

function UserDetailContent({ id }: { id: string }) {
  const { data } = useSuspenseQuery(userDetailQuery(id));
  const user = data.user;

  return (
    <>
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
        <ProfileCard user={user} />
        <OnboardingCard user={user} />
        <ActivityCard user={user} />
        <SubscriptionCard user={user} />
      </div>
    </>
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
