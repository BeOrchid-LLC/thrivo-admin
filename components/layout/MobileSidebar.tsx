"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import ThrivoLogo from "@/components/icons/ThrivoLogo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./SidebarNav";

/** Hamburger + slide-over nav below the md breakpoint. */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="flex h-14 items-center gap-3 border-b px-4">
            <ThrivoLogo className="h-8 w-8 shrink-0" />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">Thrivo</p>
              <p className="text-xs font-medium text-muted-foreground">Admin</p>
            </div>
          </SheetTitle>
          <div className="sleek-scrollbar overflow-y-auto">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
