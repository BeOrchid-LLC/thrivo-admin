import { ContentSection } from "@/components/sections/content/ContentSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.content);

export default async function ContentPage() {
  await protectPage();
  return <ContentSection />;
}
