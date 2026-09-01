import { DashboardSection } from "@/components/sections/dashboard/DashboardSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.dashboard);

export default async function DashboardPage() {
  await protectPage();
  return <DashboardSection />;
}
