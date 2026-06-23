"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import ThrivoLogo from "@/components/icons/ThrivoLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminSession } from "@/components/providers/SessionProvider";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { Admin } from "@/lib/contracts";

function initials(admin: Admin): string {
  if (admin.name) {
    return admin.name
      .split(" ")
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return admin.email.slice(0, 2).toUpperCase();
}

/** Top bar: spacer + account menu (logout). */
export function DashboardHeader() {
  const admin = useAdminSession();
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <ThrivoLogo className="h-8 w-8 shrink-0" />
        <span className="hidden text-lg font-semibold md:inline-block">Thrivo</span>
      </Link>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar>
            <AvatarFallback>{initials(admin)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{admin.name ?? admin.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void logout()}>
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
