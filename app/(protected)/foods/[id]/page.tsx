import type { Metadata } from "next";
import { FoodDetailSection } from "@/components/sections/foods/FoodDetailSection";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata(PAGE_SEO.foodDetail);
}

export default async function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FoodDetailSection id={id} />;
}
