import { Suspense } from "react";
import { ResetPasswordSent } from "./ResetPasswordSent";
import AuthLayout from "@/components/layout/AuthLayout";

export const metadata = { title: "Reset link sent — Thrivo Admin" };

export default function ResetPasswordSentPage() {
  return (
    <AuthLayout subtitle="Admin Dashboard">
      <Suspense>
        <ResetPasswordSent />
      </Suspense>
    </AuthLayout>
  );
}
