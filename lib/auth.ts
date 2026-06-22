import "server-only";
import { redirect } from "next/navigation";
import { callServerApi } from "@/lib/api/server";
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
    redirect("/login");
  }
  return admin;
}
