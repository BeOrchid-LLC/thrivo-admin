import type { AdminUserDetail } from "@/lib/contracts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatNumber } from "@/lib/format";

export function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ProfileCard({ user }: { user: AdminUserDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Tier" value={<Badge>{user.entitlement}</Badge>} />
        <Row label="Status" value={user.status} />
        <Row label="Goal" value={user.goal ?? "—"} />
        <Row
          label="Target calories"
          value={user.targetCalories ? formatNumber(user.targetCalories) : "—"}
        />
        <Row label="Joined" value={formatDate(user.createdAt)} />
      </CardContent>
    </Card>
  );
}

export function ActivityCard({ user }: { user: AdminUserDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Food logs" value={formatNumber(user.totalFoodLogs)} />
        <Row label="Current streak" value={`${user.currentStreakDays} days`} />
        <Row label="Last active" value={formatDate(user.lastActiveAt)} />
      </CardContent>
    </Card>
  );
}

export function SubscriptionCard({ user }: { user: AdminUserDetail }) {
  if (!user.subscription) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Status" value={user.subscription.status} />
        <Row label="Price" value={user.subscription.priceLabel ?? "—"} />
        <Row label="Renews" value={formatDate(user.subscription.renewsAt)} />
        <Row
          label="Cancels at period end"
          value={user.subscription.cancelAtPeriodEnd ? "Yes" : "No"}
        />
      </CardContent>
    </Card>
  );
}
