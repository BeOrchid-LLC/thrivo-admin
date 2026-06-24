import { DashboardSection } from "@/components/sections/dashboard/DashboardSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.dashboard);

export default function DashboardPage() {
  return <DashboardSection />;
}
