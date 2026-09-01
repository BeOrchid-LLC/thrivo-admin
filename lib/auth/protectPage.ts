import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/** Enforce Clerk authentication at the resource that renders protected data. */
export async function protectPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");
}
