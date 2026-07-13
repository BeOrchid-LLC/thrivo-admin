"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { callApi, queryKeys } from "@/lib/api";
import { fixtureUserDetailExtended, resolveData } from "@/lib/fixtures";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { MetricCardsFallback } from "@/components/general/skeletons/MetricCardsFallback";
import { ChartCardFallback } from "@/components/general/skeletons/ChartCardFallback";
import { UserDetailHeader } from "./UserDetailHeader";
import { UserStatCards } from "./UserStatCards";
import { UserSubscriptionCard } from "./UserSubscriptionCard";
import { SubscriptionTimeline } from "./SubscriptionTimeline";
import { ActivityTabs } from "./ActivityTabs";

export function userDetailQuery(id: string) {
  return {
    queryKey: queryKeys.users.detail(id),
    queryFn: () =>
      resolveData({ user: fixtureUserDetailExtended }, () =>
        callApi("GET_USER", { params: { id } })
      ),
  };
}

export function UserDetailSection({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <Link
        href="/users"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>

      {/* Header/stats/subscription card all share this one GET_USER fetch —
          they come off the same repository call server-side, so splitting
          them into 3 round trips would triple the DB work for no benefit.
          The timeline and activity tabs below are genuinely separate
          queries and each own their own QueryBoundary. */}
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
    <div className="space-y-6">
      <UserDetailHeader user={user} />
      <UserStatCards stats={user.stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UserSubscriptionCard userId={id} subscription={user.subscription} />
        <QueryBoundary
          fallback={<ChartCardFallback />}
          errorMessage="Could not load subscription events."
        >
          <SubscriptionTimeline userId={id} subscription={user.subscription} />
        </QueryBoundary>
      </div>

      {/* ActivityTabs composes its own per-tab QueryBoundary internally — no
          outer boundary needed here, it doesn't suspend itself. */}
      <ActivityTabs userId={id} />
    </div>
  );
}
