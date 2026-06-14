import { z } from "zod";

/**
 * Build-safe runtime config. Never throws at import (so `next build` can't fail
 * on a missing API URL); falls back to localhost. `NEXT_PUBLIC_*` values are
 * inlined into the client bundle — no secrets here (secrets live server-side).
 */
const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

const flagOn = (value: string | undefined, defaultOn: boolean) =>
  value === undefined ? defaultOn : value !== "0" && value.toLowerCase() !== "false";

export const env = {
  apiUrl: parsed.success ? parsed.data.NEXT_PUBLIC_API_URL : "http://localhost:4000",
  /** Versioned API prefix applied by the API layer. */
  apiPrefix: "/api/v1",
  /**
   * Render tables/charts from local fixtures (default ON until the backend
   * `/admin/*` endpoints exist). Set NEXT_PUBLIC_USE_FIXTURES=0 to use live data.
   */
  useFixtures: flagOn(process.env.NEXT_PUBLIC_USE_FIXTURES, true),
  /**
   * Skip the admin session/role check so the UI is reviewable without the
   * backend (default ON outside production). TODO: remove once auth is wired.
   */
  devBypassAuth: flagOn(process.env.ADMIN_DEV_BYPASS, process.env.NODE_ENV !== "production"),
} as const;

export type Env = typeof env;
