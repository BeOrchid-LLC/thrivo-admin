import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";
import AuthLayout from "@/components/layout/AuthLayout";

export const metadata = { title: "Reset password — Thrivo Admin" };

export default function ResetPasswordPage() {
  return (
    <AuthLayout subtitle="Admin Dashboard">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
