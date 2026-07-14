import { AuditLogSection } from "@/components/sections/audit/AuditLogSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.audit);

export default function AuditPage() {
  return <AuditLogSection />;
}
