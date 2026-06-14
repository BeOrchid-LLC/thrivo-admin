import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureTipsPage, resolveData } from "@/lib/fixtures";
import { ContentSection } from "@/components/sections/content/ContentSection";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.tips.list({ page: 1, pageSize: 12 }),
    queryFn: () =>
      resolveData(fixtureTipsPage, () =>
        callServerApi("LIST_TIPS", { query: { page: 1, pageSize: 12 } })
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContentSection />
    </HydrationBoundary>
  );
}
