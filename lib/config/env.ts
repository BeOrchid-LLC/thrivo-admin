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

if (!parsed.success) {
  console.warn(
    "[thrivo-admin] NEXT_PUBLIC_API_URL is missing or invalid — falling back to http://localhost:4000"
  );
}

export const env = {
  apiUrl: parsed.success ? parsed.data.NEXT_PUBLIC_API_URL : "http://localhost:4000",
  /** Versioned API prefix applied by the API layer. */
  apiPrefix: "/api/v1",
  /**
   * Render tables/charts from local fixtures (default OFF in production).
   * Set NEXT_PUBLIC_USE_FIXTURES=1 to enable.
   */
  useFixtures: process.env.NEXT_PUBLIC_USE_FIXTURES === "1",
} as const;

export type Env = typeof env;
