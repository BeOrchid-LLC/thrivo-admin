import ThrivoLogo from "@/components/icons/ThrivoLogo";
import { MobileSidebar } from "./MobileSidebar";
import { ProfileMenu } from "./ProfileMenu";
import { SidebarTrigger } from "./SidebarTrigger";

export function DashboardHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-2" />
      <div className="flex items-center gap-2 md:hidden">
        <ThrivoLogo className="h-8 w-8 shrink-0" />
        <span className="text-lg font-semibold">Thrivo</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        <ProfileMenu />
        <MobileSidebar />
      </div>
    </header>
  );
}
