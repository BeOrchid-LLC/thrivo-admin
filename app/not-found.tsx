import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.notFound);

export default function NotFound() {
  redirect("/dashboard");
}
