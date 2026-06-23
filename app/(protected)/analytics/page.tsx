import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import {
  fixtureEngagementAnalytics,
  fixtureSubscriptionAnalytics,
  resolveData,
} from "@/lib/fixtures";
import { AnalyticsSection } from "@/components/sections/analytics/AnalyticsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.analytics);

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const queryClient = makeQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.analytics.subscriptions(),
      queryFn: () =>
        resolveData({ analytics: fixtureSubscriptionAnalytics }, () =>
          callServerApi("GET_SUBSCRIPTION_ANALYTICS")
        ),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.analytics.engagement(),
      queryFn: () =>
        resolveData({ analytics: fixtureEngagementAnalytics }, () =>
          callServerApi("GET_ENGAGEMENT_ANALYTICS")
        ),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyticsSection />
    </HydrationBoundary>
  );
}
