import { ForgotPasswordForm } from "./ForgotPasswordForm";
import AuthLayout from "@/components/layout/AuthLayout";

export const metadata = { title: "Forgot password — Thrivo Admin" };

export default function ForgotPasswordPage() {
  return (
    <AuthLayout subtitle="Admin Dashboard">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
