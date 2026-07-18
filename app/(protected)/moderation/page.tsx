import { Suspense } from "react";
import { ModerationSection } from "@/components/sections/moderation/ModerationSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.moderation);

export default function ModerationPage() {
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <ModerationSection />
    </Suspense>
  );
}
