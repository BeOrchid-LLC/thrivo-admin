"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function ProfileMenu() {
  const admin = useAdminSession();
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();

  const displayName = admin.name ?? admin.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 px-2 py-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials(admin)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline-block">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">{admin.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sun className="h-3.5 w-3.5 dark:hidden" />
            <Moon className="hidden h-3.5 w-3.5 dark:inline" />
            Theme
          </p>
          <Select value={theme ?? "light"} onValueChange={setTheme}>
            <SelectTrigger className="h-8 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void logout()}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
