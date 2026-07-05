import { Suspense } from "react";
import { LeadsSection } from "@/components/sections/leads/LeadsSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.leads);

export default function LeadsPage() {
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <LeadsSection />
    </Suspense>
  );
}
