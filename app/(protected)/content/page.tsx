import { ContentSection } from "@/components/sections/content/ContentSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.content);

export default function ContentPage() {
  return <ContentSection />;
}
