import type { Metadata } from "next";
import { PushCampaignDetailSection } from "@/components/sections/push/PushCampaignDetailSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata(PAGE_SEO.pushCampaignDetail);
}

export default async function PushCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PushCampaignDetailSection id={id} />;
}
