import { Suspense } from "react";
import { BillingSection } from "@/components/sections/billing/BillingSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.billing);

export default function BillingPage() {
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <BillingSection />
    </Suspense>
  );
}
