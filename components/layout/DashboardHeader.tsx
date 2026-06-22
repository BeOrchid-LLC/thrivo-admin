"use client";

import { useQuery } from "@tanstack/react-query";
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
import { queryKeys } from "@/lib/api/query-keys";
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
export function DashboardHeader({ admin: initialAdmin }: { admin: Admin }) {
  const router = useRouter();

  // Re-validate the session on the client so the browser network tab shows the
  // call and the header always reflects the live admin identity.
  // initialAdmin (from the server RSC check) is used as initialData to avoid a
  // flash of empty content; staleTime defaults to 0 so the query still refetches.
  const { data } = useQuery({
    queryKey: queryKeys.session(),
    queryFn: async () => {
      try {
        const { admin } = await callApi("GET_SESSION");
        return admin;
      } catch (err) {
        if (isApiError(err) && (err.isAuthError || err.code === "FORBIDDEN")) {
          router.push("/login");
        }
        throw err;
      }
    },
    initialData: initialAdmin,
    retry: false,
  });

  const admin = data ?? initialAdmin;

  const handleLogout = async () => {
    try {
      await callApi("LOGOUT");
    } catch {
      // Best-effort; route out regardless.
    }
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-border bg-background px-4 md:px-6">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar>
            <AvatarFallback>{initials(admin)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{admin.name ?? admin.email}</DropdownMenuLabel>
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
