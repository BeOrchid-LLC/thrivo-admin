import { Suspense } from "react";
import { PushSection } from "@/components/sections/push/PushSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.push);

export default async function PushPage() {
  await protectPage();
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <PushSection />
    </Suspense>
  );
}
