"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { AdminUser } from "@/lib/contracts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TruncatedCell } from "@/components/general/TruncatedCell";
import { formatRelativeDate, formatDate, formatStreak } from "@/lib/format";

type PlanLabel = "Free" | "Trial" | "Premium";

const planVariant: Record<PlanLabel, "secondary" | "accent" | "success"> = {
  Free: "secondary",
  Trial: "accent",
  Premium: "success",
};

function planLabel(user: AdminUser): PlanLabel {
  if (user.tier === "free") return "Free";
  if (user.subscription?.status === "trialing") return "Trial";
  return "Premium";
}

function initials(user: AdminUser): string {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function makeRecentUsersColumns(): ColumnDef<AdminUser>[] {
  return [
    {
      id: "user",
      header: "User",
      meta: { width: "38%" },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              {user.image ? <AvatarImage src={user.image} alt="" /> : null}
              <AvatarFallback>{initials(user)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <TruncatedCell value={user.name ?? user.email} className="font-medium" />
              {user.name ? (
                <TruncatedCell value={user.email} className="text-sm text-muted-foreground" />
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      meta: { width: "16%" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      meta: { width: "12%" },
      cell: ({ row }) => {
        const label = planLabel(row.original);
        return <Badge variant={planVariant[label]}>{label}</Badge>;
      },
    },
    {
      accessorKey: "currentStreakDays",
      header: "Streak",
      meta: { width: "10%" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatStreak(row.original.currentStreakDays)}
        </span>
      ),
    },
    {
      accessorKey: "lastActiveAt",
      header: "Last Active",
      meta: { width: "14%" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatRelativeDate(row.original.lastActiveAt)}
        </span>
      ),
    },
    {
      id: "chevron",
      header: () => <span className="sr-only">Open</span>,
      meta: { width: "2.5rem", align: "center" },
      cell: () => <ChevronRight className="mx-auto h-4 w-4 text-muted-foreground" aria-hidden />,
    },
  ];
}
