import { z } from "zod";

/**
 * Build-safe runtime config. Never throws at import (so `next build` can't fail
 * on a missing API URL); falls back to localhost. `NEXT_PUBLIC_*` values are
 * inlined into the client bundle — no secrets here (secrets live server-side).
 */
const schema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

if (!parsed.success) {
  console.warn(
    "[thrivo-admin] env config invalid — check NEXT_PUBLIC_API_URL and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  );
}

export const env = {
  apiUrl: parsed.success ? parsed.data.NEXT_PUBLIC_API_URL : "http://localhost:4000",
  clerkPublishableKey: parsed.success ? parsed.data.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : "",
  /** Versioned API prefix applied by the API layer. */
  apiPrefix: "/api/v1",
  /**
   * Render tables/charts from local fixtures (default OFF in production).
   * Set NEXT_PUBLIC_USE_FIXTURES=1 to enable.
   */
  useFixtures: process.env.NEXT_PUBLIC_USE_FIXTURES === "1",
} as const;

export type Env = typeof env;
