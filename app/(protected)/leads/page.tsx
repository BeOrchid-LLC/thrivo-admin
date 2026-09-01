import { Suspense } from "react";
import { LeadsSection } from "@/components/sections/leads/LeadsSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.leads);

export default async function LeadsPage() {
  await protectPage();
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <LeadsSection />
    </Suspense>
  );
}
