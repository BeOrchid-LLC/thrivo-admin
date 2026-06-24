"use client";

import { DetailsDrawer } from "@/components/general/DetailsDrawer";
import { TableRowDetailsFooter } from "@/components/general/TableRowDetailsDrawer";
import type { AdminUser } from "@/lib/contracts";
import { UserActionsMenu } from "./UserActionsMenu";
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
      metadata={user ?? undefined}
      dataName="user"
      footer={({ onViewMetadata }) =>
        user ? (
          <TableRowDetailsFooter
            actionsMenu={<UserActionsMenu user={user} onDelete={onDelete} align="start" />}
            hasMetadata={user !== undefined}
            onViewMetadata={onViewMetadata}
          />
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
