import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureAuditLogPage, resolveData } from "@/lib/fixtures";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { AuditLogSection } from "@/components/sections/audit/AuditLogSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.audit);

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.auditLog.list({ page: 1, pageSize: DEFAULT_PAGE_SIZE }),
    queryFn: () =>
      resolveData(fixtureAuditLogPage, () =>
        callServerApi("LIST_AUDIT_LOG", { query: { page: 1, pageSize: DEFAULT_PAGE_SIZE } })
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AuditLogSection />
    </HydrationBoundary>
  );
}
