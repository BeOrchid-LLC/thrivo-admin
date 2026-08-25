import { CreditCard } from "lucide-react";
import type { AdminUserDetail } from "@/lib/contracts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney, formatDate } from "@/lib/format";
import { RefundDialog, ReconcileButton } from "./SubscriptionActions";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

const statusVariant: Record<string, "success" | "accent" | "secondary" | "destructive"> = {
  active: "success",
  trialing: "accent",
  canceled: "secondary",
  expired: "destructive",
  none: "secondary",
};

function statusLabel(status: string): string {
  if (status === "active") return "Active Premium";
  if (status === "trialing") return "Trial";
  if (status === "canceled") return "Canceled";
  if (status === "expired") return "Expired";
  return "No subscription";
}

/** Left-column card — status/plan/trial dates/first charge (+ Refund)/next
 *  billing/revenue-to-date/Stripe id/RevenueCat id. Sourced from the same
 *  GET_USER fetch as the header and stat cards. */
export function UserSubscriptionCard({
  userId,
  subscription,
}: {
  userId: string;
  subscription: AdminUserDetail["subscription"];
}) {
  const extended = subscription as typeof subscription & {
    firstCharge?: { amountCents: number; currency: string } | null;
    revenueTotalsByCurrency?: { amountCents: number; currency: string }[];
    lastSyncedAt?: string | null;
    lastWebhookAt?: string | null;
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
        <CardTitle className="text-sm">Subscription</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {!subscription ? (
          <p className="py-2 text-sm text-muted-foreground">No subscription on record.</p>
        ) : (
          <>
            <Row
              label="Status"
              value={
                <Badge variant={statusVariant[subscription.status]}>
                  {statusLabel(subscription.status)}
                </Badge>
              }
            />
            <Row label="Plan" value={subscription.priceLabel ?? "—"} />
            <Row label="Trial started" value={formatDate(subscription.trialStartedAt)} />
            <Row label="Trial converted" value={formatDate(subscription.trialConvertedAt)} />
            <Row
              label="First charge"
              value={
                <span className="flex items-center gap-2">
                  {subscription.firstChargeAt
                    ? `${formatDate(subscription.firstChargeAt)}${
                        subscription.firstChargeAmountCents !== null
                          ? ` — ${formatMoney(subscription.firstChargeAmountCents, extended.firstCharge?.currency)}`
                          : ""
                      }`
                    : "—"}
                  <RefundDialog userId={userId} />
                </span>
              }
            />
            <Row label="Next billing" value={formatDate(subscription.renewsAt)} />
            <div className="pt-1">
              <ReconcileButton userId={userId} />
            </div>
            <Row
              label="Revenue to date"
              value={
                subscription.revenueToDateCents !== null ? (
                  <span className="text-success">
                    {(extended.revenueTotalsByCurrency ?? []).length > 0
                      ? extended.revenueTotalsByCurrency
                          ?.map((money) => formatMoney(money.amountCents, money.currency))
                          .join(" · ")
                      : formatMoney(
                          subscription.revenueToDateCents,
                          extended.firstCharge?.currency
                        )}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Row label="Last synced" value={formatDate(extended.lastSyncedAt)} />
            <Row label="Last webhook" value={formatDate(extended.lastWebhookAt)} />
            <Row
              label="Stripe customer"
              value={
                subscription.stripeCustomerId ? (
                  <span className="font-mono">{subscription.stripeCustomerId}</span>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="RevenueCat ID"
              value={
                subscription.rcAppUserId ? (
                  <span className="font-mono">{subscription.rcAppUserId}</span>
                ) : (
                  "—"
                )
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
