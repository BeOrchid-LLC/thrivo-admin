import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function NotFound() {
  const admin = await getSession();
  redirect(admin ? "/dashboard" : "/login");
}
