"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Fixed left navigation rail. Active item derived from the current path. */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
          T
        </span>
        <span className="text-lg font-bold text-foreground">Thrivo</span>
        <span className="text-xs font-medium text-muted-foreground">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 sleek-scrollbar">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 text-xs text-muted-foreground">Thrivo Ops</div>
    </aside>
  );
}
