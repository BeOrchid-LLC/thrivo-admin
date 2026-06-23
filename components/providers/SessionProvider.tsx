"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { queryKeys } from "@/lib/api/query-keys";
import { callApi, isApiError } from "@/lib/api";
import type { Admin } from "@/lib/contracts";

const SessionContext = createContext<Admin | null>(null);

export function useAdminSession(): Admin {
  const admin = useContext(SessionContext);
  if (!admin) throw new Error("useAdminSession must be used within SessionProvider");
  return admin;
}

/**
 * Fires GET_SESSION on mount from the root layout, so it runs on every route
 * including the login page. On the login page:
 *   - success → redirect to /dashboard (already signed in)
 *   - failure → stay (expected when there is no session cookie)
 * On protected routes:
 *   - failure → redirect to /login (session expired or cookie cleared)
 *
 * `initialAdmin` comes from a server-side getSession() call in the root layout
 * and pre-populates the cache. It is null when no session exists (e.g. login page).
 */
export function SessionProvider({
  children,
  initialAdmin,
}: {
  children: ReactNode;
  initialAdmin: Admin | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { data } = useQuery({
    queryKey: queryKeys.session(),
    queryFn: async () => {
      try {
        const { admin } = await callApi("GET_SESSION");
        if (pathname === "/login") router.push("/dashboard");
        return admin;
      } catch (err) {
        if (isApiError(err) && (err.isAuthError || err.code === "FORBIDDEN")) {
          if (pathname !== "/login") router.push("/login");
        }
        throw err;
      }
    },
    initialData: initialAdmin ?? undefined,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return <SessionContext.Provider value={data ?? null}>{children}</SessionContext.Provider>;
}
