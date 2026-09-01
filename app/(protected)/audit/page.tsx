import { AuditLogSection } from "@/components/sections/audit/AuditLogSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.audit);

export default async function AuditPage() {
  await protectPage();
  return <AuditLogSection />;
}
