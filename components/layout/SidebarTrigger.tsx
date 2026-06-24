"use client";

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

/** Collapse/expand toggle for the desktop sidebar. */
export function SidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle sidebar"
      title="Toggle sidebar (Ctrl/Cmd+B)"
      className={cn("hidden md:inline-flex", className)}
    >
      <PanelLeft className="h-5 w-5" aria-hidden />
    </Button>
  );
}
