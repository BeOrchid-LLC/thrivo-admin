"use client";

import { useState } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import { env } from "@/lib/config/env";
import { fixtureAdminSettings, resolveData } from "@/lib/fixtures";
import type { AdminSettings } from "@/lib/contracts";
import { PageHeader } from "@/components/general/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SettingKey =
  | "pushNotificationsEnabled"
  | "dailyFoodLogReminderEnabled"
  | "psychologyTipPushEnabled"
  | "emailFoodLogReminderEnabled"
  | "weeklyReviewEmailEnabled"
  | "weightCheckReminderEnabled"
  | "hydrationReminderEnabled"
  | "subscriptionsEnabled"
  | "trialsEnabled"
  | "purchasesEnabled"
  | "cancellationsEnabled";

function Toggle({
  settings,
  setting,
  label,
  description,
  onChange,
}: {
  settings: AdminSettings;
  setting: SettingKey;
  label: string;
  description: string;
  onChange: (setting: SettingKey, value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-md border p-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={settings[setting]}
        onChange={(event) => onChange(setting, event.target.checked)}
        className="mt-1 h-4 w-4"
      />
    </label>
  );
}

export function SettingsSection() {
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.settings.admin(),
    queryFn: () =>
      resolveData({ settings: fixtureAdminSettings }, () => callApi("GET_ADMIN_SETTINGS", {})),
  });
  const [settings, setSettings] = useState<AdminSettings>(data.settings);
  const [saving, setSaving] = useState(false);

  const updateToggle = (setting: SettingKey, value: boolean) =>
    setSettings((current) =>
      setting === "emailFoodLogReminderEnabled" || setting === "weeklyReviewEmailEnabled"
        ? {
            ...current,
            emailFoodLogReminderEnabled: value,
            weeklyReviewEmailEnabled: value,
          }
        : { ...current, [setting]: value }
    );

  const save = async () => {
    setSaving(true);
    const payload = {
      pushNotificationsEnabled: settings.pushNotificationsEnabled,
      dailyFoodLogReminderEnabled: settings.dailyFoodLogReminderEnabled,
      psychologyTipPushEnabled: settings.psychologyTipPushEnabled,
      emailFoodLogReminderEnabled: settings.emailFoodLogReminderEnabled,
      weeklyReviewEmailEnabled: settings.weeklyReviewEmailEnabled,
      weightCheckReminderEnabled: settings.weightCheckReminderEnabled,
      hydrationReminderEnabled: settings.hydrationReminderEnabled,
      subscriptionsEnabled: settings.subscriptionsEnabled,
      trialsEnabled: settings.trialsEnabled,
      purchasesEnabled: settings.purchasesEnabled,
      cancellationsEnabled: settings.cancellationsEnabled,
      trialDays: settings.trialDays,
    };
    try {
      const result = env.useFixtures
        ? { settings: { ...settings, ...payload, updatedAt: new Date().toISOString() } }
        : await callApi("UPDATE_ADMIN_SETTINGS", { payload });
      setSettings(result.settings);
      queryClient.setQueryData(queryKeys.settings.admin(), result);
      toast.success("Global settings saved.");
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage global notification, email, subscription, and trial controls."
        actions={
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Global controls apply before each user&apos;s own preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle
              settings={settings}
              setting="pushNotificationsEnabled"
              label="Push notifications"
              description="Master switch for all push delivery."
              onChange={updateToggle}
            />
            <Toggle
              settings={settings}
              setting="dailyFoodLogReminderEnabled"
              label="Food-log reminders"
              description="Controls scheduled reminders to log food."
              onChange={updateToggle}
            />
            <Toggle
              settings={settings}
              setting="psychologyTipPushEnabled"
              label="Psychology-tip pushes"
              description="Controls psychology-tip push notifications only."
              onChange={updateToggle}
            />
            <p className="text-xs text-muted-foreground">
              In-app check-in tips are independent and remain available when psychology-tip pushes
              are disabled.
            </p>
            <Toggle
              settings={settings}
              setting="weightCheckReminderEnabled"
              label="Weight reminders"
              description="Controls global weight-check push delivery."
              onChange={updateToggle}
            />
            <Toggle
              settings={settings}
              setting="hydrationReminderEnabled"
              label="Hydration reminders"
              description="Controls global hydration push delivery."
              onChange={updateToggle}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Email channels are independent of the push master switch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle
              settings={settings}
              setting="emailFoodLogReminderEnabled"
              label="Food-log reminder email"
              description="Controls the linked email-reminder preference."
              onChange={updateToggle}
            />
            <Toggle
              settings={settings}
              setting="weeklyReviewEmailEnabled"
              label="Weekly review email"
              description="Linked with the food-log reminder email control."
              onChange={updateToggle}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>Operational switches for subscription flows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle
              settings={settings}
              setting="subscriptionsEnabled"
              label="Subscriptions"
              description="Enable subscription operations globally."
              onChange={updateToggle}
            />
            <Toggle
              settings={settings}
              setting="purchasesEnabled"
              label="Purchases"
              description="Allow new purchases."
              onChange={updateToggle}
            />
            <Toggle
              settings={settings}
              setting="cancellationsEnabled"
              label="Cancellations"
              description="Allow cancellation operations."
              onChange={updateToggle}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trials</CardTitle>
            <CardDescription>Control trial availability and duration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle
              settings={settings}
              setting="trialsEnabled"
              label="Trials"
              description="Enable new trials."
              onChange={updateToggle}
            />
            <div className="space-y-2">
              <Label htmlFor="trial-days">Trial days</Label>
              <Input
                id="trial-days"
                type="number"
                min={1}
                max={90}
                value={settings.trialDays}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    trialDays: Math.min(90, Math.max(1, Number(event.target.value) || 1)),
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
