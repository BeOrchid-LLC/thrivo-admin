import { create } from "zustand";
import type { Admin } from "@/lib/contracts";

/**
 * Compatibility shim — session state is now managed by Clerk.
 *
 * `logout` is wired at runtime by SessionProvider (via wireAuthLogout) to
 * Clerk's signOut so that AppSidebar and ProfileMenu can call it without
 * importing Clerk hooks. `setAdmin` is a no-op retained for pages that set a
 * session after a hand-rolled flow (accept-invite, reset-password) — those
 * pages will be retired once the Clerk invitation/password-reset flows are
 * fully activated; for now they compile without error and the Clerk session
 * takes precedence.
 */
interface AuthShim {
  setAdmin: (admin: Admin) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthShim>()(() => ({
  setAdmin: () => {},
  logout: () => {},
}));

/** Called by SessionProvider to wire Clerk's signOut into the store. */
export function wireAuthLogout(fn: () => void): void {
  useAuthStore.setState({ logout: fn });
}
