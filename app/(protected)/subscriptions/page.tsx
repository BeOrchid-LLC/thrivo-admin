import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureSubscriptionsPage, resolveData } from "@/lib/fixtures";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { SubscriptionsSection } from "@/components/sections/subscriptions/SubscriptionsSection";

export const dynamic = "force-dynamic";

const initialParams = { page: 1, pageSize: DEFAULT_PAGE_SIZE, status: "all" };

export default async function SubscriptionsPage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.subscriptions.list(initialParams),
    queryFn: () =>
      resolveData(fixtureSubscriptionsPage, () =>
        callServerApi("LIST_SUBSCRIPTIONS", { query: { page: 1, pageSize: DEFAULT_PAGE_SIZE } })
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscriptionsSection />
    </HydrationBoundary>
  );
}
