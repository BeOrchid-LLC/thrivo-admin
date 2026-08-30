"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { callApi, queryKeys } from "@/lib/api";
import { POLL_INTERVALS } from "@/lib/query/make-query-client";
import { fixtureUserTimeline, resolveData } from "@/lib/fixtures";
import type { AdminUserDetail } from "@/lib/contracts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/general/states";
import { formatDate } from "@/lib/format";
import { TimelineEntryRow } from "./TimelineEntryRow";
import { CancelDialog } from "./SubscriptionActions";
import { fixtureBillingEvents } from "@/lib/fixtures/ops";
import { formatMoney } from "@/lib/format";

export function userTimelineQuery(id: string) {
  return {
    queryKey: queryKeys.users.timeline(id),
    queryFn: () =>
      resolveData({ timeline: fixtureUserTimeline }, () =>
        callApi("GET_USER_TIMELINE", { params: { id } })
      ),
    refetchInterval: POLL_INTERVALS.operational,
  };
}

/** Right-column card — its own independent fetch (GET_USER_TIMELINE), unlike
 *  the header/stats/subscription card which share one GET_USER call. */
export function SubscriptionTimeline({
  userId,
  subscription,
}: {
  userId: string;
  subscription: AdminUserDetail["subscription"];
}) {
  const { data } = useSuspenseQuery(userTimelineQuery(userId));
  const billing = useQuery({
    queryKey: queryKeys.billing.userEvents(userId),
    queryFn: () =>
      resolveData({ events: fixtureBillingEvents.items }, () =>
        callApi("GET_USER_BILLING_EVENTS", { params: { id: userId } })
      ),
  });
  const entries = data.timeline;

  const isLive =
    subscription &&
    !subscription.cancelAtPeriodEnd &&
    (subscription.status === "active" || subscription.status === "trialing");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <CardTitle className="text-sm">Subscription events</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState title="No events yet" />
        ) : (
          <div>
            {entries.map((entry, i) => (
              <TimelineEntryRow
                key={`${entry.type}-${entry.occurredAt}`}
                entry={entry}
                isLast={i === entries.length - 1}
              />
            ))}
          </div>
        )}

        {billing.data?.events?.length ? (
          <div className="mt-4 border-t pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Billing activity
            </p>
            <div className="space-y-2 text-sm">
              {billing.data.events.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between gap-3">
                  <span>{event.eventType.replaceAll("_", " ")}</span>
                  <span className="text-muted-foreground">
                    {event.priceAmountCents !== null
                      ? formatMoney(event.priceAmountCents, event.currency)
                      : "—"}{" "}
                    · {formatDate(event.occurredAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {subscription ? (
          <>
            <Separator className="my-4" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              {isLive ? (
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Next charge — {subscription.priceLabel ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(subscription.renewsAt)}, scheduled
                  </p>
                </div>
              ) : (
                <span />
              )}
              <CancelDialog userId={userId} />
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
