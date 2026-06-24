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

function formatBool(value: boolean) {
  return value ? "Yes" : "No";
}

export function ProfileCard({ user }: { user: AdminUserDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Tier" value={<Badge>{user.tier}</Badge>} />
        <Row label="Account status" value={user.accountStatus} />
        <Row label="Lifecycle status" value={user.status} />
        <Row label="Goal" value={user.goal ?? "—"} />
        <Row label="Sex" value={user.sex ?? "—"} />
        <Row label="Age" value={user.age ?? "—"} />
        <Row label="Height (cm)" value={user.heightCm ?? "—"} />
        <Row label="Weight (kg)" value={user.weightKg ?? "—"} />
        <Row label="Target weight (kg)" value={user.targetWeightKg ?? "—"} />
        <Row label="TDEE" value={user.tdeeKcal ? formatNumber(user.tdeeKcal) : "—"} />
        <Row
          label="Daily target (kcal)"
          value={user.dailyTargetKcal ? formatNumber(user.dailyTargetKcal) : "—"}
        />
        <Row
          label="Macros (P/C/F g)"
          value={
            user.targetProteinG != null
              ? `${user.targetProteinG} / ${user.targetCarbsG ?? "—"} / ${user.targetFatG ?? "—"}`
              : "—"
          }
        />
        <Row label="Activity level" value={user.activityLevel ?? "—"} />
        <Row label="Timezone" value={user.timezone ?? "—"} />
        <Row label="Joined" value={formatDate(user.createdAt)} />
      </CardContent>
    </Card>
  );
}

export function OnboardingCard({ user }: { user: AdminUserDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Step" value={user.onboardingStep} />
        <Row label="Skipped (raw)" value={formatBool(user.onboardingSkipped)} />
        <Row label="Onboarded" value={formatBool(user.isOnboarded)} />
        <Row label="Onboarding skipped" value={formatBool(user.isOnboardingSkipped)} />
        <Row label="Trial ends" value={formatDate(user.trialEndsAt)} />
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
        <Row label="Updated at" value={formatDate(user.updatedAt)} />
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
        <Row label="Mirror status" value={user.subscriptionStatus ?? "—"} />
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
