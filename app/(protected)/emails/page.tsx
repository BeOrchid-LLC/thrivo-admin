import { EmailLogsSection } from "@/components/sections/emails/EmailLogsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.emails);

export default function EmailsPage() {
  return <EmailLogsSection />;
}
