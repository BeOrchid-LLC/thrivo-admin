"use client";

import type { ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { AppLoader } from "@/components/general/AppLoader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

/**
 * Client-side guard: shows a loading state while Clerk resolves the session,
 * then renders the dashboard shell once authenticated. This is UX only, not a
 * security boundary — no data renders without passing the backend's Clerk
 * verification on every /api/v1/admin/* call.
 */
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded || !isSignedIn) {
    return <AppLoader />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
