"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Entitlement, SubscriptionRow } from "@/lib/contracts";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CancelDialog,
  RefundDialog,
  ReconcileButton,
} from "@/components/sections/users/SubscriptionActions";

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

export function makeSubscriptionColumns(canManage: boolean): ColumnDef<SubscriptionRow>[] {
  return [
    {
      accessorKey: "userEmail",
      header: "User",
      cell: ({ row }) => (
        <Link
          href={`/users/${row.original.userId}`}
          onClick={(event) => event.stopPropagation()}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.userEmail}
        </Link>
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
      cell: ({ row }) =>
        row.original.priceLabel ?? <span className="text-muted-foreground">—</span>,
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
    ...(canManage
      ? [
          {
            id: "actions",
            header: "",
            meta: { width: "48px", align: "right" },
            cell: ({ row }: { row: { original: SubscriptionRow } }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Actions for ${row.original.userEmail}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${row.original.userId}`}>Open user</Link>
                  </DropdownMenuItem>
                  <div className="px-2 py-1">
                    <CancelDialog userId={row.original.userId} />
                  </div>
                  <div className="px-2 py-1">
                    <RefundDialog userId={row.original.userId} />
                  </div>
                  <div className="px-2 py-1">
                    <ReconcileButton userId={row.original.userId} />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          } satisfies ColumnDef<SubscriptionRow>,
        ]
      : []),
  ];
}

export const subscriptionColumns = makeSubscriptionColumns(false);
