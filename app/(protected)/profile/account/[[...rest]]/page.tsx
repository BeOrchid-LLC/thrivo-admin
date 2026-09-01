import { UserProfile } from "@clerk/nextjs";
import { protectPage } from "@/lib/auth/protectPage";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  await protectPage();
  return <UserProfile />;
}
