import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureEmailLogsPage, resolveData } from "@/lib/fixtures";
import { EmailLogsSection } from "@/components/sections/emails/EmailLogsSection";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.emailLogs.list({ page: 1, pageSize: 12 }),
    queryFn: () =>
      resolveData(fixtureEmailLogsPage, () =>
        callServerApi("LIST_EMAIL_LOGS", { query: { page: 1, pageSize: 12 } })
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EmailLogsSection />
    </HydrationBoundary>
  );
}
