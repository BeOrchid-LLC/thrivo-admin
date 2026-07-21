"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppLoader } from "@/components/general/AppLoader";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES } from "@/lib/routes";
import type { AdminV2 as Admin } from "@/lib/contracts";

const SessionContext = createContext<Admin | null>(null);

export function useAdminSession(): Admin {
  const admin = useContext(SessionContext);
  if (!admin) throw new Error("useAdminSession must be used within SessionProvider");
  return admin;
}

/**
 * Single source of truth for auth-driven navigation.
 *
 * On mount: fires initSession() once — calls GET_SESSION, stores the result.
 * On [admin, initComplete, pathname]: drives all routing decisions in one place.
 *   - authenticated + public auth page  → replace("/dashboard")
 *   - unauthenticated + protected        → replace("/login")
 * While initLoading: renders a full-screen loading state so protected pages
 * never flash before the session check resolves.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const admin = useAuthStore((s) => s.admin);
  const initLoading = useAuthStore((s) => s.initLoading);
  const initComplete = useAuthStore((s) => s.initComplete);
  const initSession = useAuthStore((s) => s.initSession);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    void initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initComplete) return;

    const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
    const isPublicAuth = PUBLIC_AUTH_ROUTES.some((p) => pathname.startsWith(p));

    if (!admin && isProtected) {
      router.replace("/login");
    } else if (admin && isPublicAuth) {
      router.replace("/dashboard");
    }
  }, [admin, initComplete, pathname, router]);

  if (initLoading) {
    return <AppLoader />;
  }

  return <SessionContext.Provider value={admin}>{children}</SessionContext.Provider>;
}
