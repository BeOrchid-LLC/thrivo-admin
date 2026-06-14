import "server-only";
import { redirect } from "next/navigation";
import { env } from "@/lib/config/env";
import { callServerApi } from "@/lib/api/server";
import type { Admin } from "@/lib/contracts";

/**
 * Server-side session + admin-role guard (ADMIN_ARCHITECTURE §4). Layered with
 * `middleware.ts` (edge cookie gate) — this is the authorization boundary.
 *
 * Dev-permissive while the backend auth routes are unwired: returns a stub admin
 * when ADMIN_DEV_BYPASS is on so the UI is reviewable.
 * TODO: remove the bypass once `GET_SESSION` is live.
 */
const DEV_ADMIN: Admin = {
  id: "dev-admin",
  email: "ops@beorchid.com",
  name: "Dev Admin",
  role: "admin",
};

export async function getSession(): Promise<Admin | null> {
  if (env.devBypassAuth) return DEV_ADMIN;
  try {
    const { admin } = await callServerApi("GET_SESSION");
    return admin;
  } catch {
    return null;
  }
}

/** Redirect to /login unless the caller is an authenticated admin. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getSession();
  if (!admin || admin.role !== "admin") {
    redirect("/login");
  }
  return admin;
}
