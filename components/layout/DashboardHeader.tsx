"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { callApi, isApiError } from "@/lib/api";

/** Top bar: spacer + account menu (logout). */
export function DashboardHeader() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await callApi("LOGOUT");
    } catch (error) {
      // Backend auth isn't wired yet; log non-network errors and route out anyway.
      if (isApiError(error) && error.code !== "NETWORK" && error.code !== "UNAUTHENTICATED") {
        console.error(error);
      }
    }
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-border bg-background px-4 md:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar>
            <AvatarFallback>OP</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Thrivo Ops</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
