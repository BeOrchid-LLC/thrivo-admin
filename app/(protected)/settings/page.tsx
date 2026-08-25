import { SettingsSection } from "@/components/sections/settings/SettingsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.settings);

export default function SettingsPage() {
  return (
    <QueryBoundary fallback={<TableContentSkeleton />} errorMessage="Could not load settings.">
      <SettingsSection />
    </QueryBoundary>
  );
}
