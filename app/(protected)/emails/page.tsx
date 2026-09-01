import { EmailLogsSection } from "@/components/sections/emails/EmailLogsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.emails);

export default async function EmailsPage() {
  await protectPage();
  return <EmailLogsSection />;
}
