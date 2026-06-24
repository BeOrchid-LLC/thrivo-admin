import type { Metadata } from "next";
import { UserDetailSection } from "@/components/sections/users/UserDetailSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata(PAGE_SEO.userDetail);
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserDetailSection id={id} />;
}
