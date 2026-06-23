import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureDashboardMetrics, resolveData } from "@/lib/fixtures";
import { DashboardSection } from "@/components/sections/dashboard/DashboardSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.dashboard);

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.metrics.dashboard(),
    queryFn: () =>
      resolveData({ metrics: fixtureDashboardMetrics }, () =>
        callServerApi("GET_DASHBOARD_METRICS")
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardSection />
    </HydrationBoundary>
  );
}
