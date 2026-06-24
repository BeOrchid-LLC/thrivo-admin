"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AdminUser } from "@/lib/contracts";
import { TruncatedCell } from "@/components/general/TruncatedCell";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { UserActionsMenu } from "./UserActionsMenu";

const tierVariant: Record<AdminUser["tier"], "default" | "secondary"> = {
  premium: "default",
  free: "secondary",
};

const statusVariant: Record<AdminUser["status"], "success" | "accent" | "destructive"> = {
  active: "success",
  suspended: "accent",
  deleted: "destructive",
};

interface UserColumnHandlers {
  onDelete?: (user: AdminUser) => void;
}

export function makeUserColumns(handlers: UserColumnHandlers): ColumnDef<AdminUser>[] {
  return [
    {
      accessorKey: "email",
      header: "Email",
      meta: { width: "28%" },
      cell: ({ row }) => (
        <TruncatedCell value={row.original.email} className="font-medium text-foreground" />
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      meta: { width: "18%" },
      cell: ({ row }) =>
        row.original.name ? (
          <TruncatedCell value={row.original.name} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "tier",
      header: "Tier",
      meta: { width: "10%" },
      cell: ({ row }) => (
        <Badge variant={tierVariant[row.original.tier]}>{row.original.tier}</Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: { width: "10%" },
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      meta: { width: "12%" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      accessorKey: "lastActiveAt",
      header: "Last active",
      meta: { width: "12%" },
      cell: ({ row }) => (
        <span className="text-muted-foreground">{formatDate(row.original.lastActiveAt)}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      meta: { width: "3.5rem", align: "center" },
      cell: ({ row }) => (
        <div
          className="flex justify-center"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <UserActionsMenu user={row.original} onDelete={handlers.onDelete} />
        </div>
      ),
    },
  ];
}
