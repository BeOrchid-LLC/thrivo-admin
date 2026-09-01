import { SettingsSection } from "@/components/sections/settings/SettingsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.settings);

export default async function SettingsPage() {
  await protectPage();
  return (
    <QueryBoundary fallback={<TableContentSkeleton />} errorMessage="Could not load settings.">
      <SettingsSection />
    </QueryBoundary>
  );
}
