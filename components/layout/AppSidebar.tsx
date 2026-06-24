"use client";

import { LogOut } from "lucide-react";
import ThrivoLogo from "@/components/icons/ThrivoLogo";
import { SidebarNav } from "./SidebarNav";
import { useSidebar } from "./sidebar-context";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminSession } from "@/components/providers/SessionProvider";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";

/** Desktop sidebar (hidden below md; MobileSidebar handles small screens). */
export function AppSidebar() {
  const admin = useAdminSession();
  const logout = useAuthStore((s) => s.logout);
  const { collapsed } = useSidebar();

  const name = admin.name ?? "Admin";
  const email = admin.email;

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-linear md:flex",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-2" : "gap-3 px-4"
        )}
      >
        <ThrivoLogo className="h-8 w-8 shrink-0" />
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-foreground">Thrivo</p>
            <p className="text-xs font-medium text-muted-foreground">Admin</p>
          </div>
        ) : null}
      </div>

      <div className="sleek-scrollbar mt-2 flex-1 overflow-y-auto">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className={cn("border-t border-border p-3", collapsed && "px-2")}>
        {!collapsed ? (
          <div className="mb-2 flex flex-col px-3">
            <span className="truncate font-medium">{name}</span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </div>
        ) : null}

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => void logout()}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </Button>
        )}
      </div>
    </aside>
  );
}
