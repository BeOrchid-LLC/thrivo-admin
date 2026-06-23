import { QueryClient, isServer } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/errors";

const MINUTE = 60 * 1000;

export const POLL_INTERVALS = {
  /** Dashboard KPI cards — fresher because ops act on these. */
  dashboard: 2 * MINUTE,
  /** Tables, logs, and analytics — 5-min poll matches arch spec (ADR-0011). */
  operational: 5 * MINUTE,
} as const;

/** A QueryClient with admin-sensible defaults (polling-friendly; no retry on auth). */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // short — admin data is operational
        gcTime: 5 * MINUTE,
        refetchOnWindowFocus: true,
        refetchInterval: POLL_INTERVALS.operational,
        retry: (failureCount, error) => {
          if (
            isApiError(error) &&
            ["UNAUTHENTICATED", "FORBIDDEN", "VALIDATION"].includes(error.code)
          )
            return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** Fresh client per request on the server; a singleton in the browser. */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
