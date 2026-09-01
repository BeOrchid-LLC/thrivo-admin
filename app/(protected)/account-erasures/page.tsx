import { AccountErasuresSection } from "@/components/sections/erasures/AccountErasuresSection";
import { protectPage } from "@/lib/auth/protectPage";

export default async function AccountErasuresPage() {
  await protectPage();
  return <AccountErasuresSection />;
}
