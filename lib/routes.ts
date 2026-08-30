/**
 * Single source of truth for route classification. Used by SessionProvider
 * (auth guard) and anywhere else that needs to know whether a path requires
 * a session or is publicly reachable without one.
 */

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/users",
  "/subscriptions",
  "/analytics",
  "/content",
  "/emails",
  "/audit",
  "/leads",
  "/foods",
  "/billing",
  "/account-erasures",
  "/push",
  "/moderation",
  "/admins",
  "/settings",
];

/** Auth pages that should bounce an already-authenticated admin to the dashboard. */
export const PUBLIC_AUTH_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password-sent",
  "/reset-password",
  "/accept-invite",
];
