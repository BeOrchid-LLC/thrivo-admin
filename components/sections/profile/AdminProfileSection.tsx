"use client";

import { useState } from "react";
import {
  Activity,
  BadgeCheck,
  Check,
  CreditCard,
  FileText,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Shield,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useClerk } from "@clerk/nextjs";
import { useAdminSession } from "@/components/providers/SessionProvider";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import { fixtureAuditLogPage, resolveData } from "@/lib/fixtures";
import {
  ADMIN_PERMISSION_OPTIONS,
  ADMIN_ROLE_DEFAULT_PERMISSIONS,
  type AdminSelfProfile,
  type AdminRoleV2,
  type AuditLogEntry,
} from "@/lib/contracts";
import { PageHeader } from "@/components/general/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ACTIVITY_PAGE_SIZE = 10;

const roleLabels: Record<AdminRoleV2, string> = {
  "super-admin": "Super admin",
  admin: "Admin",
  support: "Support",
  "read-only": "Read-only",
};

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email.slice(0, 2).toUpperCase();
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={`text-right font-medium ${mono ? "break-all font-mono text-xs" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function ProfileOverview({
  name,
  email,
  id,
  role,
  status,
}: {
  name: string | null;
  email: string;
  id: string;
  role: AdminRoleV2;
  status?: AdminSelfProfile["status"];
}) {
  const displayName = name ?? email;

  return (
    <Card className="h-fit">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Avatar className="h-28 w-28">
            <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
              {getInitials(name, email)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h2 className="break-words text-2xl font-bold text-foreground">{displayName}</h2>
            <p className="break-all text-sm text-muted-foreground">{email}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="default">{roleLabels[role]}</Badge>
            <Badge variant="success">{status ? `${status} account` : "Active session"}</Badge>
          </div>

          <Separator />

          <dl className="w-full space-y-3 text-left">
            <InfoRow label="Admin ID" value={id} mono />
            <InfoRow label="Authentication" value="Clerk" />
            <InfoRow label="Session" value="Authenticated" />
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({
  name,
  email,
  id,
  role,
  profile,
  profileUnavailable,
}: {
  name: string | null;
  email: string;
  id: string;
  role: AdminRoleV2;
  profile: AdminSelfProfile | null;
  profileUnavailable: boolean;
}) {
  const displayName = name ?? email;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Account overview</h3>
        <p className="text-sm text-muted-foreground">
          The identity currently associated with your Thrivo Admin session.
        </p>
      </div>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoTile icon={UserRound} label="Display name" value={displayName} />
        <InfoTile icon={BadgeCheck} label="Email address" value={email} />
        <InfoTile icon={Shield} label="Admin role" value={roleLabels[role]} />
        <InfoTile
          icon={LockKeyhole}
          label="Authentication provider"
          value={profile?.authProvider ?? "Clerk"}
        />
      </div>
      {profile ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile icon={BadgeCheck} label="Account status" value={profile.status} />
          <InfoTile icon={Activity} label="Created" value={formatTimestamp(profile.createdAt)} />
          <InfoTile
            icon={RefreshCw}
            label="Last sign-in"
            value={profile.lastLoginAt ? formatTimestamp(profile.lastLoginAt) : "Not recorded"}
          />
          <InfoTile
            icon={Users}
            label="Invited by"
            value={profile.invitedByEmail ?? "Not applicable"}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
          {profileUnavailable
            ? "Backend profile details are temporarily unavailable. The session identity is shown as a fallback."
            : "Loading backend profile details…"}
        </div>
      )}
      <p className="hidden" aria-hidden>
        {id}
      </p>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

function PermissionsTab({
  role,
  profile,
}: {
  role: AdminRoleV2;
  profile: AdminSelfProfile | null;
}) {
  const granted = new Set(
    profile?.effectivePermissions ?? ADMIN_ROLE_DEFAULT_PERMISSIONS[role] ?? []
  );
  const permissionSource = profile?.permissionSource ?? "role";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Permissions</h3>
        <p className="text-sm text-muted-foreground">
          {permissionSource === "custom"
            ? "Custom permissions resolved by the backend for this admin account."
            : `Role-derived permissions for the ${roleLabels[role]} role.`}
        </p>
      </div>
      <Separator />
      <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
        <div>
          <p className="font-medium">{granted.size} permissions granted</p>
          <p className="text-sm text-muted-foreground">
            Permission changes are managed by authorized administrators.
          </p>
        </div>
        <Shield className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {ADMIN_PERMISSION_OPTIONS.map((permission) => {
          const isGranted = granted.has(permission.value);
          return (
            <div
              key={permission.value}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                isGranted ? "border-primary/20 bg-primary/5" : "opacity-60"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  isGranted
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isGranted ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
              </span>
              <span className="text-sm">{permission.label}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {permissionSource === "custom"
          ? "The backend is authoritative for this custom permission set. Changes are managed by authorized administrators."
          : "The backend is currently applying the default permissions for this role."}
      </p>
    </div>
  );
}

function activityIcon(entry: AuditLogEntry): LucideIcon {
  const action = entry.action.toLowerCase();
  const target = entry.targetType.toLowerCase();
  if (action.includes("auth") || action.includes("login") || action.includes("password")) {
    return KeyRound;
  }
  if (target.includes("user") || target.includes("admin")) return Users;
  if (target.includes("subscription") || target.includes("billing")) return CreditCard;
  if (target.includes("tip") || target.includes("content")) return FileText;
  return Activity;
}

function ActivityTab() {
  const [page, setPage] = useState(1);
  const activityParams = { page, pageSize: ACTIVITY_PAGE_SIZE } as const;
  const query = useQuery({
    queryKey: queryKeys.profile.activity(activityParams),
    queryFn: () =>
      resolveData(fixtureAuditLogPage, () =>
        callApi("GET_ADMIN_PROFILE_ACTIVITY", {
          query: { page, pageSize: ACTIVITY_PAGE_SIZE },
        })
      ),
  });

  if (query.isLoading) {
    return <ActivitySkeleton />;
  }

  if (query.isError) {
    const forbidden = isApiError(query.error) && query.error.code === "FORBIDDEN";
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-8 text-center">
        <Shield className="h-8 w-8 text-muted-foreground" aria-hidden />
        <div>
          <h3 className="font-medium">
            {forbidden ? "Activity is restricted" : "Activity unavailable"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {forbidden
              ? "Your account does not have permission to view audit activity."
              : "We could not load your recent activity."}
          </p>
        </div>
        {!forbidden ? (
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  const entries = query.data?.items ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Recent activity</h3>
          <p className="text-sm text-muted-foreground">Your latest recorded admin actions.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCw className={query.isFetching ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>
      <Separator />
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Activity className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="mt-3 font-medium">No activity yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your audited admin actions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const Icon = activityIcon(entry);
            return (
              <div key={entry.id} className="flex items-start gap-3 rounded-lg bg-muted/30 p-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{entry.action}</p>
                    <Badge variant="outline">{entry.targetType}</Badge>
                  </div>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {entry.targetId ? `Target ${entry.targetId} · ` : ""}
                    {formatTimestamp(entry.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {query.data && query.data.pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || query.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {query.data.pagination.page} of {query.data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= query.data.pagination.totalPages || query.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading activity">
      <div>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <Separator />
      <div className="space-y-3">
        {["one", "two", "three"].map((key) => (
          <div key={key} className="flex gap-3 rounded-lg bg-muted/30 p-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  const { openUserProfile } = useClerk();

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your sign-in methods and account security through Clerk.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col items-start justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-medium">Clerk account security</p>
            <p className="text-sm text-muted-foreground">
              Update your password, profile identity, and available security methods.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => openUserProfile()}>
          Manage account
        </Button>
      </div>
    </div>
  );
}

export function AdminProfileSection() {
  const admin = useAdminSession();
  const profileQuery = useQuery({
    queryKey: queryKeys.profile.detail(),
    queryFn: () => callApi("GET_ADMIN_PROFILE"),
  });
  const profile = profileQuery.data?.admin ?? null;
  const identity = profile ?? admin;
  const role = identity.role as AdminRoleV2;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="View your admin profile, permissions, and activity."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileOverview
          name={identity.name}
          email={identity.email}
          id={identity.id}
          role={role}
          status={profile?.status}
        />

        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle className="sr-only">Profile details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="overview" className="w-full">
              <div className="max-w-full overflow-x-auto pb-1">
                <TabsList aria-label="Profile sections" className="w-max min-w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview">
                <OverviewTab
                  name={identity.name}
                  email={identity.email}
                  id={identity.id}
                  role={role}
                  profile={profile}
                  profileUnavailable={profileQuery.isError}
                />
              </TabsContent>
              <TabsContent value="permissions">
                <PermissionsTab role={role} profile={profile} />
              </TabsContent>
              <TabsContent value="activity">
                <ActivityTab />
              </TabsContent>
              <TabsContent value="security">
                <SecurityTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
