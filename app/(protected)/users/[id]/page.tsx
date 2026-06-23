import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { makeQueryClient } from "@/lib/query/make-query-client";
import { queryKeys } from "@/lib/api";
import { callServerApi } from "@/lib/api/server";
import { fixtureUserDetail, resolveData } from "@/lib/fixtures";
import { UserDetailSection } from "@/components/sections/users/UserDetailSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata(PAGE_SEO.userDetail);
}

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = makeQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () =>
      resolveData({ user: fixtureUserDetail }, () => callServerApi("GET_USER", { params: { id } })),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserDetailSection id={id} />
    </HydrationBoundary>
  );
}
