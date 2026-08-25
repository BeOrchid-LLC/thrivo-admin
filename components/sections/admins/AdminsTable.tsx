"use client";

import { useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
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
import { fixtureAdminAccounts, fixtureAuditLogPage, resolveData } from "@/lib/fixtures";
import { env } from "@/lib/config/env";
import type { AdminListResponse } from "@/lib/contracts";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditAdminDialog } from "./EditAdminDialog";
import { useCapability } from "@/lib/hooks/useCapability";

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
  revoked: "secondary",
};

function AdminDetailSheet({
  admin,
  open,
  onOpenChange,
}: {
  admin: AdminAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const audit = useQuery({
    queryKey: queryKeys.auditLog.list({ page: 1, pageSize: 10, targetId: admin?.id }),
    queryFn: () =>
      resolveData(
        {
          ...fixtureAuditLogPage,
          items: fixtureAuditLogPage.items.filter((entry) => entry.targetId === admin?.id),
        },
        () => callApi("LIST_AUDIT_LOG", { query: { page: 1, pageSize: 10, targetId: admin?.id } })
      ),
    enabled: open && !!admin,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{admin?.name ?? admin?.email ?? "Admin details"}</SheetTitle>
          <SheetDescription>{admin?.email}</SheetDescription>
        </SheetHeader>
        {admin ? (
          <div className="space-y-5 px-6 py-4 text-sm">
            <div className="space-y-2">
              <div>
                <strong>Role:</strong> {admin.role}
              </div>
              <div>
                <strong>Status:</strong> {admin.status}
              </div>
              <div>
                <strong>Last login:</strong>{" "}
                {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "Never"}
              </div>
              <div>
                <strong>Invite expires:</strong>{" "}
                {admin.inviteExpiresAt ? formatDate(admin.inviteExpiresAt) : "—"}
              </div>
              <div>
                <strong>Access:</strong>{" "}
                {admin.permissions
                  ? `${admin.permissions.length} custom permissions`
                  : "Role defaults"}
              </div>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Admin activity</h3>
              {audit.data?.items.length === 0 ? (
                <p className="text-muted-foreground">No activity recorded for this admin.</p>
              ) : audit.isLoading ? (
                <p className="text-muted-foreground">Loading activity…</p>
              ) : (
                <div className="space-y-2">
                  {audit.data?.items.map((entry) => (
                    <div key={entry.id} className="rounded border p-2">
                      <div className="font-medium">{entry.action}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(entry.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function adminListQuery() {
  return {
    queryKey: queryKeys.admins.list(),
    queryFn: () => resolveData({ items: fixtureAdminAccounts }, () => callApi("LIST_ADMINS", {})),
  };
}

function AdminActions({ admin }: { admin: AdminAccount }) {
  const { canManageAdmins } = useCapability();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  if (!canManageAdmins) return null;

  const resendInvite = async () => {
    try {
      if (env.useFixtures) {
        queryClient.setQueryData<AdminListResponse>(queryKeys.admins.list(), (current) => ({
          items: (current?.items ?? []).map((item) =>
            item.id === admin.id ? { ...item, status: "invited", inviteRevokedAt: null } : item
          ),
        }));
      } else {
        await callApi("RESEND_ADMIN_INVITE", { params: { id: admin.id } });
      }
      toast.success("Invite resent.");
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Failed to resend invite.");
    }
  };

  const revokeInvite = async () => {
    if (!window.confirm(`Revoke the pending invitation for ${admin.email}?`)) return;
    try {
      if (env.useFixtures) {
        queryClient.setQueryData<AdminListResponse>(queryKeys.admins.list(), (current) => ({
          items: (current?.items ?? []).map((item) =>
            item.id === admin.id
              ? { ...item, status: "revoked", inviteRevokedAt: new Date().toISOString() }
              : item
          ),
        }));
      } else {
        await callApi("REVOKE_ADMIN_INVITE", { params: { id: admin.id } });
      }
      toast.success("Invite revoked.");
      if (!env.useFixtures) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.admins.list() });
      }
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Failed to revoke invite.");
    }
  };

  const toggleDisable = async () => {
    const newStatus = admin.status === "disabled" ? "active" : "disabled";
    if (
      newStatus === "disabled" &&
      !window.confirm(`Disable ${admin.email}? Their admin access will be blocked.`)
    ) {
      return;
    }
    try {
      if (env.useFixtures) {
        queryClient.setQueryData<AdminListResponse>(queryKeys.admins.list(), (current) => ({
          items: (current?.items ?? []).map((item) =>
            item.id === admin.id ? { ...item, status: newStatus } : item
          ),
        }));
      } else {
        await callApi("UPDATE_ADMIN", { params: { id: admin.id }, payload: { status: newStatus } });
      }
      toast.success(newStatus === "disabled" ? "Admin disabled." : "Admin re-enabled.");
      if (!env.useFixtures) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.admins.list() });
      }
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Failed to update admin.");
    }
  };

  return (
    <>
      <EditAdminDialog admin={admin} open={editOpen} onOpenChange={setEditOpen} />
      <AdminDetailSheet admin={admin} open={detailOpen} onOpenChange={setDetailOpen} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-11 w-11">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDetailOpen(true)}>View details</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>Edit</DropdownMenuItem>
          {(admin.status === "invited" || admin.status === "revoked") && (
            <DropdownMenuItem onClick={resendInvite}>Resend invite</DropdownMenuItem>
          )}
          {admin.status === "invited" && (
            <DropdownMenuItem onClick={revokeInvite}>Revoke invite</DropdownMenuItem>
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
    accessorKey: "permissions",
    header: "Access",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.permissions ? `${row.original.permissions.length} custom` : "Role defaults"}
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
