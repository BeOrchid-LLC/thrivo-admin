"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import { type AdminAccount, type AdminRoleV2, type AdminAccountStatus } from "@/lib/contracts";
import { DataTable } from "@/components/general/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";
import { EditAdminDialog } from "./EditAdminDialog";

const roleVariant: Record<AdminRoleV2, "default" | "secondary" | "accent" | "outline"> = {
  "super-admin": "default",
  admin: "accent",
  support: "secondary",
  "read-only": "outline",
};

const statusVariant: Record<AdminAccountStatus, "success" | "accent" | "secondary"> = {
  active: "success",
  invited: "accent",
  disabled: "secondary",
};

function adminListQuery() {
  return {
    queryKey: queryKeys.admins.list(),
    queryFn: () => callApi("LIST_ADMINS", {}),
  };
}

function AdminActions({ admin }: { admin: AdminAccount }) {
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const resendInvite = async () => {
    try {
      await callApi("RESEND_ADMIN_INVITE", { params: { id: admin.id } });
      toast.success("Invite resent.");
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Failed to resend invite.");
    }
  };

  const toggleDisable = async () => {
    const newStatus = admin.status === "disabled" ? "active" : "disabled";
    try {
      await callApi("UPDATE_ADMIN", { params: { id: admin.id }, payload: { status: newStatus } });
      toast.success(newStatus === "disabled" ? "Admin disabled." : "Admin re-enabled.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.admins.list() });
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Failed to update admin.");
    }
  };

  return (
    <>
      <EditAdminDialog admin={admin} open={editOpen} onOpenChange={setEditOpen} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-11 w-11">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          {admin.status === "invited" && (
            <DropdownMenuItem onClick={resendInvite}>Resend invite</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={toggleDisable}
          >
            {admin.status === "disabled" ? "Re-enable" : "Disable"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

const columns: ColumnDef<AdminAccount>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.email}</span>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name ?? <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant={roleVariant[row.original.role]}>{row.original.role}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last login",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.lastLoginAt ? formatDate(row.original.lastLoginAt) : "Never"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <AdminActions admin={row.original} />,
  },
];

export function AdminsTable() {
  const { data } = useSuspenseQuery(adminListQuery());

  return <DataTable columns={columns} data={data.items} emptyMessage="No admins found." />;
}
