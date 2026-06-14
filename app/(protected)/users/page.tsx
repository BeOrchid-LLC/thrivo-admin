import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureUsersPage, resolveData } from "@/lib/fixtures";
import { UsersSection } from "@/components/sections/users/UsersSection";

export const dynamic = "force-dynamic";

const initialParams = { page: 1, pageSize: 12, search: "", status: "all" };

export default async function UsersPage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.list(initialParams),
    queryFn: () =>
      resolveData(fixtureUsersPage, () =>
        callServerApi("LIST_USERS", { query: { page: 1, pageSize: 12 } })
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UsersSection />
    </HydrationBoundary>
  );
}
