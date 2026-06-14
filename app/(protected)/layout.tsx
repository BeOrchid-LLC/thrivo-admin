import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireAdmin } from "@/lib/auth";

// Session-aware shell; re-verified per request.
export const dynamic = "force-dynamic";

/** Second line of defense: server-side admin check, then render the shell. */
export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return <DashboardLayout>{children}</DashboardLayout>;
}
