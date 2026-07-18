import { Suspense } from "react";
import { FoodsSection } from "@/components/sections/foods/FoodsSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.foods);

export default function FoodsPage() {
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <FoodsSection />
    </Suspense>
  );
}
