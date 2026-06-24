"use client";

import type { AdminUser } from "@/lib/contracts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: AdminUser;
  onClick?: () => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
  return (
    <Card
      className={cn("transition-colors", onClick && "cursor-pointer hover:bg-muted/50")}
      onClick={onClick}
    >
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{user.email}</p>
            {user.name ? (
              <p className="truncate text-sm text-muted-foreground">{user.name}</p>
            ) : null}
          </div>
          <Badge variant={user.status === "active" ? "success" : "accent"}>{user.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{user.tier}</span>
          <span>·</span>
          <span>Joined {formatDate(user.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
