"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { AppLoader } from "@/components/general/AppLoader";
import { wireAuthLogout } from "@/lib/store/useAuthStore";
import { setApiTokenGetter } from "@/lib/api/auth-token";
import { PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES } from "@/lib/routes";
import type { Admin, AdminRoleV2 } from "@/lib/contracts";

const SessionContext = createContext<Admin | null>(null);

export function useAdminSession(): Admin {
  const admin = useContext(SessionContext);
  if (!admin) throw new Error("useAdminSession must be used within SessionProvider");
  return admin;
}

/**
 * Single source of truth for auth-driven navigation.
 *
 * Reads the Clerk session via useUser(), derives the Admin object from the
 * Clerk user's profile and public metadata (role is stored there by the Admin
 * Clerk app's JWT template), then drives routing the same way the hand-rolled
 * SessionProvider did:
 *   - authenticated + public auth page  → replace("/dashboard")
 *   - unauthenticated + protected        → replace("/login")
 *
 * Also wires the logout callback into useAuthStore so AppSidebar and
 * ProfileMenu can call useAuthStore(s => s.logout)() without hooks.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, session } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    wireAuthLogout(() => void signOut({ redirectUrl: "/login" }));
    setApiTokenGetter(() => session?.getToken() ?? Promise.resolve(null));
  }, [signOut, session]);

  const admin = useMemo<Admin | null>(
    () =>
      isSignedIn && user
        ? {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress ?? "",
            name: user.fullName || null,
            role: (user.publicMetadata?.role as AdminRoleV2) ?? "read-only",
          }
        : null,
    [isSignedIn, user]
  );

  useEffect(() => {
    if (!isLoaded) return;

    const isProtected = PROTECTED_ROUTES.some((p) => pathname.startsWith(p));
    const isPublicAuth = PUBLIC_AUTH_ROUTES.some((p) => pathname.startsWith(p));

    if (!admin && isProtected) {
      router.replace("/login");
    } else if (admin && isPublicAuth) {
      router.replace("/dashboard");
    }
  }, [admin, isLoaded, pathname, router]);

  if (!isLoaded) {
    return <AppLoader />;
  }

  return <SessionContext.Provider value={admin}>{children}</SessionContext.Provider>;
}
