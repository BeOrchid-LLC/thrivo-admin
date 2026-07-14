import { AnalyticsSection } from "@/components/sections/analytics/AnalyticsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.analytics);

export default function AnalyticsPage() {
  return <AnalyticsSection />;
}
