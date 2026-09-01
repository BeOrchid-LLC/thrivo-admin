import { Suspense } from "react";
import { BillingSection } from "@/components/sections/billing/BillingSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.billing);

export default async function BillingPage() {
  await protectPage();
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <BillingSection />
    </Suspense>
  );
}
