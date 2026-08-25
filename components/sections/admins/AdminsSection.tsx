"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { PageHeader } from "@/components/general/PageHeader";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { TableContentSkeleton } from "@/components/general/TableContentSkeleton";
import { Button } from "@/components/ui/button";
import { AdminsTable } from "./AdminsTable";
import { InviteAdminDialog } from "./InviteAdminDialog";
import { useCapability } from "@/lib/hooks/useCapability";

export function AdminsSection() {
  const { canManageAdmins } = useCapability();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admins"
        description="Manage admin accounts, roles, and access."
        actions={
          canManageAdmins ? (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite admin
            </Button>
          ) : null
        }
      />

      <InviteAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <QueryBoundary fallback={<TableContentSkeleton />} errorMessage="Could not load admins.">
        <AdminsTable />
      </QueryBoundary>
    </div>
  );
}
