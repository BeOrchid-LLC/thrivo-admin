import { Suspense } from "react";
import { UsersSection } from "@/components/sections/users/UsersSection";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.users);

export default function UsersPage() {
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <UsersSection />
    </Suspense>
  );
}
