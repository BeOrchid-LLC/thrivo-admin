"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DetailsDrawer } from "@/components/general/DetailsDrawer";
import { TableRowDetailsFooter } from "@/components/general/TableRowDetailsDrawer";
import { Button } from "@/components/ui/button";
import type { AdminUser } from "@/lib/contracts";
import { UserActionsMenu } from "./UserActionsMenu";
import { UserAvatar } from "./UserDetailHeader";
import { ActivityCard, OnboardingCard, ProfileCard, SubscriptionCard } from "./UserProfileCards";

interface UserDetailDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
  onDelete: (user: AdminUser) => void;
}

export function UserDetailDrawer({ user, onClose, onDelete }: UserDetailDrawerProps) {
  return (
    <DetailsDrawer
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={user?.name ?? user?.email ?? "User"}
      description={user?.email}
      headerExtra={
        user ? (
          <div className="flex justify-center pt-2">
            <UserAvatar user={user} className="h-36 w-36" />
          </div>
        ) : null
      }
      metadata={user ?? undefined}
      dataName="user"
      footer={({ onViewMetadata }) =>
        user ? (
          <TableRowDetailsFooter
            actionsMenu={<UserActionsMenu user={user} onDelete={onDelete} align="start" />}
            hasMetadata={user !== undefined}
            onViewMetadata={onViewMetadata}
          >
            <Link href={`/users/${user.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                View full details
              </Button>
            </Link>
          </TableRowDetailsFooter>
        ) : null
      }
    >
      {user ? (
        <div className="space-y-4">
          <ProfileCard user={user} />
          <OnboardingCard user={user} />
          <ActivityCard user={user} />
          <SubscriptionCard user={user} />
        </div>
      ) : null}
    </DetailsDrawer>
  );
}
