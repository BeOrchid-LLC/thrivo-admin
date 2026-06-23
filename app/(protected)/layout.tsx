"use client";

import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/lib/store/useAuthStore";

/**
 * Client-side guard: shows a loading state while the session is initialising
 * (handled by SessionProvider), then renders the dashboard shell once an
 * authenticated admin is confirmed. Unauthenticated access is handled at two
 * levels: the edge middleware (cookie presence) and the SessionProvider
 * useEffect (session validity).
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const admin = useAuthStore((s) => s.admin);
  const initLoading = useAuthStore((s) => s.initLoading);

  if (initLoading || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
