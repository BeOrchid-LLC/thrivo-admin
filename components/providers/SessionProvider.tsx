"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { AppLoader } from "@/components/general/AppLoader";
import { wireAuthLogout } from "@/lib/store/useAuthStore";
import { setApiTokenGetter } from "@/lib/api/auth-token";
import { callApi } from "@/lib/api/client";
import { PROTECTED_ROUTES, PUBLIC_AUTH_ROUTES } from "@/lib/routes";
import {
  ADMIN_PERMISSION_OPTIONS,
  type Admin,
  type AdminPermission,
  type AdminRoleV2,
} from "@/lib/contracts";

const SessionContext = createContext<Admin | null>(null);

export function useAdminSession(): Admin {
  const admin = useContext(SessionContext);
  if (!admin) throw new Error("useAdminSession must be used within SessionProvider");
  return admin;
}

/**
 * Single source of truth for auth-driven navigation.
 *
 * Reads the Clerk session via useUser(), derives a resilient fallback Admin
 * object from the Clerk user's profile and public metadata, and then replaces
 * it with the backend's authoritative admin session when available. Routing
 * follows the same behavior as the hand-rolled SessionProvider:
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
  // `undefined` means the current Clerk session has not registered its token
  // getter yet. `null` is the registered unauthenticated state.
  const [registeredSession, setRegisteredSession] = useState<typeof session>();
  const [serverAdmin, setServerAdmin] = useState<Admin>();

  useEffect(() => {
    wireAuthLogout(() => void signOut({ redirectUrl: "/login" }));

    if (!isLoaded) {
      setRegisteredSession(undefined);
      return;
    }

    if (isSignedIn && !session) {
      setApiTokenGetter(() => Promise.resolve(null));
      setRegisteredSession(undefined);
      return;
    }

    setApiTokenGetter(() => session?.getToken() ?? Promise.resolve(null));
    setRegisteredSession(session);
  }, [isLoaded, isSignedIn, session, signOut]);

  const isApiAuthReady =
    isLoaded && registeredSession === session && (isSignedIn ? Boolean(session) : session === null);

  const clerkAdmin = useMemo<Admin | null>(() => {
    if (!isSignedIn || !user) return null;
    const metadata = user.publicMetadata as { role?: unknown; permissions?: unknown };
    const role = (metadata.role as AdminRoleV2) ?? "read-only";
    const permissions = Array.isArray(metadata.permissions)
      ? metadata.permissions.filter((value): value is AdminPermission =>
          ADMIN_PERMISSION_OPTIONS.some((option) => option.value === value)
        )
      : null;
    return {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: user.fullName || null,
      role,
      permissions,
    };
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!isApiAuthReady || !isSignedIn) {
      setServerAdmin(undefined);
      return;
    }

    let cancelled = false;
    void callApi("GET_ADMIN_SESSION")
      .then(({ admin: currentAdmin }) => {
        if (cancelled) return;
        // The backend role is authoritative. Permission defaults are applied
        // by useCapability, matching the backend permission ladder.
        setServerAdmin({ ...currentAdmin, permissions: null });
      })
      .catch(() => {
        // Keep Clerk metadata as a resilience fallback if the session read is
        // temporarily unavailable. Mutations remain backend-authorized.
        if (!cancelled) setServerAdmin(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [isApiAuthReady, isSignedIn]);

  const admin = serverAdmin ?? clerkAdmin;

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

  if (!isApiAuthReady) {
    return <AppLoader />;
  }

  return <SessionContext.Provider value={admin}>{children}</SessionContext.Provider>;
}
