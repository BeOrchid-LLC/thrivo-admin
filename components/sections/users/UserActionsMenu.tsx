"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ActionsMenu } from "@/components/general/ActionsMenu";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import { env } from "@/lib/config/env";
import type { AdminUser } from "@/lib/contracts";
import { useCapability } from "@/lib/hooks/useCapability";
import { CancelDialog, RefundDialog } from "./SubscriptionActions";
import { getUserActions } from "./userActions";

interface UserActionsMenuProps {
  user: AdminUser;
  onDelete?: (user: AdminUser) => void;
  align?: "start" | "end";
  showViewDetails?: boolean;
}

export function UserActionsMenu({
  user,
  onDelete,
  align = "end",
  showViewDetails = true,
}: UserActionsMenuProps) {
  const { canManageUsers, canManageSubscriptions } = useCapability();
  const queryClient = useQueryClient();
  const [subscriptionDialog, setSubscriptionDialog] = useState<"cancel" | "refund" | null>(null);
  const reconcile = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({})
        : callApi("RECONCILE_SUBSCRIPTION", { params: { id: user.id } }),
    onSuccess: () => {
      toast.success("Reconcile enqueued.");
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user.id) });
      void queryClient.invalidateQueries({ queryKey: ["users", "list"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["subscriptions", "list"], exact: false });
    },
    onError: (error) =>
      toast.error(isApiError(error) ? error.message : "Could not reconcile subscription."),
  });
  // Hard delete is admin-only; support/read-only never see the option (the
  // backend enforces it too — this just avoids offering a 403).
  const options = getUserActions(
    user,
    {
      onDelete: canManageUsers ? onDelete : undefined,
      onCancelSubscription: canManageSubscriptions
        ? () => setSubscriptionDialog("cancel")
        : undefined,
      onRefundSubscription: canManageSubscriptions
        ? () => setSubscriptionDialog("refund")
        : undefined,
      onReconcileSubscription: canManageSubscriptions ? () => reconcile.mutate() : undefined,
    },
    { includeViewDetails: showViewDetails }
  );

  if (options.length === 0) return null;

  return (
    <>
      <ActionsMenu options={options} align={align} ariaLabel={`Actions for ${user.email}`} />
      <CancelDialog
        userId={user.id}
        open={subscriptionDialog === "cancel"}
        onOpenChange={(open) => !open && setSubscriptionDialog(null)}
      />
      <RefundDialog
        userId={user.id}
        open={subscriptionDialog === "refund"}
        onOpenChange={(open) => !open && setSubscriptionDialog(null)}
      />
    </>
  );
}
