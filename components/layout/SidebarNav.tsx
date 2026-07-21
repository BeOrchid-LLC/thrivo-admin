"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "@/lib/navigation";
import { useCapability } from "@/lib/hooks/useCapability";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  onNavigate?: () => void;
  collapsed?: boolean;
}

export function SidebarNav({ onNavigate, collapsed = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { canManageAdmins } = useCapability();

  return (
    <nav className={cn("flex flex-col gap-5 py-4", collapsed ? "px-2" : "px-3")}>
      {navGroups.map((group) => {
        const visibleItems = group.items.filter((item) => !item.superAdminOnly || canManageAdmins);
        if (visibleItems.length === 0) return null;
        return (
          <div key={group.label} className="flex flex-col gap-1">
            {!collapsed ? (
              <p className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-md py-2 text-sm transition-colors",
                    collapsed ? "justify-center px-2" : "gap-3 px-2",
                    active
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {!collapsed ? <span>{item.label}</span> : null}
                </Link>
              );

              return collapsed ? (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
