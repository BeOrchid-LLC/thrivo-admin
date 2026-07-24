import { Suspense } from "react";
import { AcceptInviteForm } from "./AcceptInviteForm";
import AuthLayout from "@/components/layout/AuthLayout";

export const metadata = { title: "Accept invitation — Thrivo Admin" };

export default function AcceptInvitePage() {
  return (
    <AuthLayout subtitle="Admin Dashboard">
      <Suspense>
        <AcceptInviteForm />
      </Suspense>
    </AuthLayout>
  );
}
