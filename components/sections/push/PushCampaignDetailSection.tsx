"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { callApi, queryKeys } from "@/lib/api";
import { QueryBoundary } from "@/components/general/QueryBoundary";
import { MetricCardsFallback } from "@/components/general/skeletons/MetricCardsFallback";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import type { EndpointResponse } from "@/lib/api";

type PushCampaignDetail = EndpointResponse<"GET_PUSH_CAMPAIGN">["campaign"];

const STATUS_VARIANT: Record<string, "success" | "secondary" | "destructive" | "accent"> = {
  sent: "success",
  sending: "accent",
  draft: "secondary",
  scheduled: "secondary",
  failed: "destructive",
};

function segmentLabel(s: PushCampaignDetail["segment"]): string {
  if (s.all) return "Everyone";
  const parts: string[] = [];
  if (s.tier) parts.push(s.tier);
  if (s.subscriptionStatus) parts.push(`sub:${s.subscriptionStatus}`);
  if (s.lastActiveWithinDays) parts.push(`active ≤${s.lastActiveWithinDays}d`);
  return parts.join(" · ") || "—";
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4">
      <span className="min-w-40 text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}

function pushCampaignDetailQuery(id: string) {
  return {
    queryKey: queryKeys.push.campaign(id),
    queryFn: () => callApi("GET_PUSH_CAMPAIGN", { params: { id } }),
  };
}

function CampaignDetailContent({ id }: { id: string }) {
  const { data } = useSuspenseQuery(pushCampaignDetailQuery(id));
  const c = data.campaign;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">{c.title}</h1>
        <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>{c.status}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tabular-nums">{c.recipientCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
              {c.sentCount}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={`text-2xl font-bold tabular-nums ${c.failedCount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
            >
              {c.failedCount}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaign details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <DetailRow label="Body">{c.body}</DetailRow>
          {c.deepLink && <DetailRow label="Deep link">{c.deepLink}</DetailRow>}
          <Separator />
          <DetailRow label="Audience">{segmentLabel(c.segment)}</DetailRow>
          <DetailRow label="Created by">{c.createdByAdminEmail}</DetailRow>
          <DetailRow label="Created at">{formatDate(c.createdAt)}</DetailRow>
          {c.scheduledAt && <DetailRow label="Scheduled">{formatDate(c.scheduledAt)}</DetailRow>}
          {c.sentAt && <DetailRow label="Sent at">{formatDate(c.sentAt)}</DetailRow>}
        </CardContent>
      </Card>
    </div>
  );
}

export function PushCampaignDetailSection({ id }: { id: string }) {
  return (
    <div className="space-y-6">
      <Link
        href="/push"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to campaigns
      </Link>

      <QueryBoundary
        fallback={<MetricCardsFallback count={3} />}
        errorMessage="Could not load campaign details."
      >
        <CampaignDetailContent id={id} />
      </QueryBoundary>
    </div>
  );
}
