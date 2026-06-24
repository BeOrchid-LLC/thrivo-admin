"use client";

import { useQuery } from "@tanstack/react-query";
import { DetailsDrawer } from "@/components/general/DetailsDrawer";
import { TableRowDetailsFooter } from "@/components/general/TableRowDetailsDrawer";
import { LoadingState, ErrorState } from "@/components/general/states";
import type { AdminUser } from "@/lib/contracts";
import { userDetailQuery } from "./UserDetailSection";
import { UserActionsMenu } from "./UserActionsMenu";
import { ActivityCard, ProfileCard, SubscriptionCard } from "./UserProfileCards";

interface UserDetailDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
  onDelete: (user: AdminUser) => void;
}

export function UserDetailDrawer({ user, onClose, onDelete }: UserDetailDrawerProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    ...userDetailQuery(user?.id ?? ""),
    enabled: user !== null,
  });

  const detail = data?.user;
  const metadata = detail ?? user ?? undefined;

  return (
    <DetailsDrawer
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={detail?.name ?? user?.name ?? user?.email ?? "User"}
      description={detail?.email ?? user?.email}
      metadata={metadata}
      dataName="user"
      footer={({ onViewMetadata }) =>
        user ? (
          <TableRowDetailsFooter
            actionsMenu={<UserActionsMenu user={user} onDelete={onDelete} align="start" />}
            hasMetadata={metadata !== undefined}
            onViewMetadata={onViewMetadata}
          />
        ) : null
      }
    >
      {isLoading ? (
        <LoadingState message="Loading user…" />
      ) : isError || !detail ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <div className="space-y-4">
          <ProfileCard user={detail} />
          <ActivityCard user={detail} />
          <SubscriptionCard user={detail} />
        </div>
      )}
    </DetailsDrawer>
  );
}
