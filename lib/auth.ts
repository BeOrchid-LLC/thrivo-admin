import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { callServerApi } from "@/lib/api/server";
import { SESSION_COOKIE } from "@/lib/constants";
import type { Admin } from "@/lib/contracts";

export async function getSession(): Promise<Admin | null> {
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
    // Delete the stale cookie so any edge-level cookie check won't loop.
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/login");
  }
  return admin;
}
