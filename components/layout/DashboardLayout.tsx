import type { PropsWithChildren } from "react";
import { env } from "@/lib/config/env";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

/** Viewport-height shell: fixed sidebar + header row + scrollable main. */
export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader />
        {env.useFixtures ? (
          <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-800">
            <span>⚠</span>
            <span>
              FIXTURE MODE — data shown is synthetic. Set{" "}
              <code className="rounded bg-amber-200 px-1">NEXT_PUBLIC_USE_FIXTURES=0</code> to use
              the live backend.
            </span>
          </div>
        ) : null}
        <main className="min-h-0 flex-1 overflow-auto sleek-scrollbar px-4 py-6 md:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
