/**
 * Local Zod contracts for the Thrivo admin API (`/api/v1/admin/*`).
 *
 * Mirrors the mobile approach: these live here for now and become a one-line
 * swap to `@thrivo/contracts` (ADMIN_ARCHITECTURE §3) when that package ships —
 * the rest of the app only imports `@/lib/contracts`.
 */
export * from "./common";
export * from "./auth";
export * from "./subscription";
export * from "./user";
export * from "./analytics";
export * from "./content";
export * from "./logs";
