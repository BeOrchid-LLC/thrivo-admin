import type { PropsWithChildren } from "react";
import { env } from "@/lib/config/env";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarProvider } from "./sidebar-context";

/** Viewport-height shell: collapsible sidebar + header + scrollable main. */
export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          {env.useFixtures ? (
            <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <span>⚠</span>
              <span>
                FIXTURE MODE — data shown is synthetic. Set{" "}
                <code className="rounded bg-amber-200 px-1 dark:bg-amber-900">
                  NEXT_PUBLIC_USE_FIXTURES=0
                </code>{" "}
                to use the live backend.
              </span>
            </div>
          ) : null}
          <main className="sleek-scrollbar flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
