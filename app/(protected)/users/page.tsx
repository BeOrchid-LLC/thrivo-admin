import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureUsersPage, resolveData } from "@/lib/fixtures";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { UsersSection } from "@/components/sections/users/UsersSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.users);

export const dynamic = "force-dynamic";

const initialParams = { page: 1, pageSize: DEFAULT_PAGE_SIZE, search: "", status: "all" };

export default async function UsersPage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.list(initialParams),
    queryFn: () =>
      resolveData(fixtureUsersPage, () =>
        callServerApi("LIST_USERS", { query: { page: 1, pageSize: DEFAULT_PAGE_SIZE } })
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersSection />
    </HydrationBoundary>
  );
}
