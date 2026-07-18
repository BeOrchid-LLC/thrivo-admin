import { Suspense } from "react";
import { PushSection } from "@/components/sections/push/PushSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.push);

export default function PushPage() {
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <PushSection />
    </Suspense>
  );
}
