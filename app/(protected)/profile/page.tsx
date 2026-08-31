import { AdminProfileSection } from "@/components/sections/profile/AdminProfileSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata(PAGE_SEO.profile);

export default function ProfilePage() {
  return <AdminProfileSection />;
}
