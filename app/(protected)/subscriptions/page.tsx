import { Suspense } from "react";
import { SubscriptionsSection } from "@/components/sections/subscriptions/SubscriptionsSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.subscriptions);

export default async function SubscriptionsPage() {
  await protectPage();
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <SubscriptionsSection />
    </Suspense>
  );
}
