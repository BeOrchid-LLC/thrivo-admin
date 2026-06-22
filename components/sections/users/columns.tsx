"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import type { AdminUser } from "@/lib/contracts";
import type { Entitlement } from "@/lib/contracts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

const entitlementVariant: Record<Entitlement, "default" | "secondary"> = {
  premium: "default",
  free: "secondary",
};

const statusVariant: Record<AdminUser["status"], "success" | "accent" | "destructive"> = {
  active: "success",
  suspended: "accent",
  deleted: "destructive",
};

export function makeUserColumns(
  onDelete: (user: AdminUser) => void
): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "entitlement",
      header: "Tier",
      cell: ({ row }) => (
        <Badge variant={entitlementVariant[row.original.entitlement]}>
          {row.original.entitlement}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: "lastActiveAt",
      header: "Last active",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.lastActiveAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          title="Delete user permanently"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row.original);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];
}
