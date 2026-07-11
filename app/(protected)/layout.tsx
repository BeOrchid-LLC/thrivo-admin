"use client";

import type { ReactNode } from "react";
import { AppLoader } from "@/components/general/AppLoader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/lib/store/useAuthStore";

/**
 * Client-side guard: shows a loading state while the session is initialising
 * (handled by SessionProvider), then renders the dashboard shell once an
 * authenticated admin is confirmed. This is UX only, not a security boundary
 * — no data renders without passing the backend's own auth check on every
 * `/api/v1/admin/*` call. See ADR-0024 and ADMIN_ARCHITECTURE.md §4 for the
 * full auth model.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const admin = useAuthStore((s) => s.admin);
  const initLoading = useAuthStore((s) => s.initLoading);

  if (initLoading || !admin) {
    return <AppLoader />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
