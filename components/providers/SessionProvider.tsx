"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
 * Fires GET_SESSION exactly once on mount (when the protected layout mounts).
 * Subsequent navigations within the protected area keep this provider alive,
 * so no further calls are made unless the provider itself unmounts and remounts.
 *
 * `initialAdmin` (from the server-side requireAdmin() call) populates the cache
 * immediately so children never render without admin data. The query still runs
 * once to validate the session on the client side.
 */
export function SessionProvider({
  children,
  initialAdmin,
}: {
  children: ReactNode;
  initialAdmin: Admin;
}) {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: queryKeys.session(),
    queryFn: async () => {
      try {
        const { admin } = await callApi("GET_SESSION");
        return admin;
      } catch (err) {
        if (isApiError(err) && (err.isAuthError || err.code === "FORBIDDEN")) {
          router.push("/login");
        }
        throw err;
      }
    },
    initialData: initialAdmin,
    retry: false,
    // Opt this query out of window-focus and reconnect refetches — the session
    // check is a one-shot on app mount, not a poll.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return <SessionContext.Provider value={data ?? initialAdmin}>{children}</SessionContext.Provider>;
}
