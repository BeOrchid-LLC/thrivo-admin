import { UserProfile } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function AccountProfilePage() {
  return <UserProfile />;
}
