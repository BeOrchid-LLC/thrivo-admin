import { LoginForm } from "./LoginForm";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.login);

export default function LoginPage() {
  return <LoginForm />;
}
