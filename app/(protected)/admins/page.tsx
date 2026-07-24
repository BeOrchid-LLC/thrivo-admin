import { AdminsSection } from "@/components/sections/admins/AdminsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.admins);

export default function AdminsPage() {
  return <AdminsSection />;
}
