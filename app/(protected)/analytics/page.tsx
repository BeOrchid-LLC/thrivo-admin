import { AnalyticsSection } from "@/components/sections/analytics/AnalyticsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.analytics);

export default async function AnalyticsPage() {
  await protectPage();
  return <AnalyticsSection />;
}
