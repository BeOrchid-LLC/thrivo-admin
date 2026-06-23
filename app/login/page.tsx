import { LoginForm } from "./LoginForm";
import AuthLayout from "@/components/layout/AuthLayout";
import { createPageMetadata } from "@/lib/seo/metadata";
import { PAGE_SEO } from "@/lib/seo/pages";

export const metadata = createPageMetadata(PAGE_SEO.login);

export default function LoginPage() {
  return (
    <AuthLayout subtitle="Admin Dashboard">
      <LoginForm />
    </AuthLayout>
  );
}
