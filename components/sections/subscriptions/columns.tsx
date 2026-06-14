"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Entitlement, SubscriptionRow } from "@/lib/contracts";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

const entitlementVariant: Record<Entitlement, "default" | "secondary"> = {
  premium: "default",
  free: "secondary",
};

const statusVariant: Record<
  SubscriptionRow["status"],
  "success" | "accent" | "secondary" | "destructive"
> = {
  active: "success",
  trialing: "accent",
  canceled: "secondary",
  expired: "destructive",
  none: "secondary",
};

export const subscriptionColumns: ColumnDef<SubscriptionRow>[] = [
  {
    accessorKey: "userEmail",
    header: "User",
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.userEmail}</span>
    ),
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
    accessorKey: "priceLabel",
    header: "Price",
    cell: ({ row }) => row.original.priceLabel ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "upgradeTrigger",
    header: "Upgrade trigger",
    cell: ({ row }) =>
      row.original.upgradeTrigger ? (
        <Badge variant="outline">{row.original.upgradeTrigger}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "renewsAt",
    header: "Renews",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{formatDate(row.original.renewsAt)}</span>
    ),
  },
];
