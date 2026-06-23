import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const admin = await getSession();
  if (admin) redirect("/dashboard");
  return <LoginForm />;
}
