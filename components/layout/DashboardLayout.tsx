import type { PropsWithChildren } from "react";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

/** Viewport-height shell: fixed sidebar + header row + scrollable main. */
export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        <main className="min-h-0 flex-1 overflow-auto sleek-scrollbar px-4 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
