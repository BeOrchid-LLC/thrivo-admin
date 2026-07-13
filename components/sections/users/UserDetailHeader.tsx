import { Mail } from "lucide-react";
import type { UserDetail } from "@/lib/api/user-detail-contracts.local";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatRelativeDate } from "@/lib/format";

type PlanLabel = "Free" | "Trial" | "Premium";

const planVariant: Record<PlanLabel, "secondary" | "accent" | "success"> = {
  Free: "secondary",
  Trial: "accent",
  Premium: "success",
};

function planLabel(user: UserDetail): PlanLabel {
  if (user.tier === "free") return "Free";
  if (user.subscription?.status === "trialing") return "Trial";
  return "Premium";
}

function initials(user: UserDetail): string {
  const source = user.name?.trim() || user.email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

/** Joined/device/last-active/conversion-trigger line — each segment renders
 *  only when its data actually exists (device + trigger both stay empty for
 *  every user until a future mobile-app task starts reporting them). */
function metaLine(user: UserDetail): string {
  const segments = [`Joined ${formatDate(user.createdAt)}`];
  if (user.device?.osVersion || user.device?.deviceModel) {
    const platform = user.device.platform === "android" ? "Android" : "iOS";
    const version = user.device.osVersion ? ` ${user.device.osVersion}` : "";
    const model = user.device.deviceModel ? ` (${user.device.deviceModel})` : "";
    segments.push(`${platform}${version}${model}`);
  }
  if (user.lastActiveAt) segments.push(`Last active ${formatRelativeDate(user.lastActiveAt)}`);
  if (user.convertedViaTrigger) segments.push(`Converted via ${user.convertedViaTrigger}`);
  return segments.join(" · ");
}

export function UserDetailHeader({ user }: { user: UserDetail }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <Avatar className="h-12 w-12">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="bg-primary text-base font-bold text-primary-foreground">
              {initials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{user.name ?? user.email}</h1>
              <Badge variant={planVariant[planLabel(user)]}>{planLabel(user)}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {user.email} · <span className="font-mono">usr_{user.id.slice(-8)}</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{metaLine(user)}</p>
          </div>
        </div>
        {/* No "email user" endpoint exists anywhere in the backend — a plain
            mailto: link rather than inventing a send-email action. */}
        <Button asChild size="sm">
          <a href={`mailto:${user.email}`}>
            <Mail className="h-4 w-4" />
            Email user
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
