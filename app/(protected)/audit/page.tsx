import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureAuditLogPage, resolveData } from "@/lib/fixtures";
import { AuditLogSection } from "@/components/sections/audit/AuditLogSection";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.auditLog.list({ page: 1, pageSize: 12 }),
    queryFn: () =>
      resolveData(fixtureAuditLogPage, () =>
        callServerApi("LIST_AUDIT_LOG", { query: { page: 1, pageSize: 12 } })
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuditLogSection />
    </HydrationBoundary>
  );
}
