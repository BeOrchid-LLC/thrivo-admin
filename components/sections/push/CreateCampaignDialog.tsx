"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError, type EndpointResponse } from "@/lib/api";
import { env } from "@/lib/config/env";
import type { PushCampaignRow, PushSegment } from "@/lib/contracts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(120, "Max 120 characters"),
  body: z.string().min(1, "Body is required").max(500, "Max 500 characters"),
  deepLink: z.string().optional(),
});

type FormValues = z.infer<typeof createSchema>;

function buildSegment(
  mode: "all" | "filters",
  tier: string,
  sub: string,
  days: string
): PushSegment | null {
  if (mode === "all") return { all: true };
  const seg: PushSegment = {};
  if (tier !== "any") seg.tier = tier as "free" | "premium";
  if (sub !== "any") seg.subscriptionStatus = sub as PushSegment["subscriptionStatus"];
  if (days.trim()) seg.lastActiveWithinDays = Number(days);
  const hasFilter =
    seg.tier !== undefined ||
    seg.subscriptionStatus !== undefined ||
    seg.lastActiveWithinDays !== undefined;
  return hasFilter ? seg : null;
}

export function CreateCampaignDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<"all" | "filters">("all");
  const [tier, setTier] = useState("any");
  const [sub, setSub] = useState("any");
  const [days, setDays] = useState("");
  const [segmentError, setSegmentError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<{ userCount: number; tokenCount: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: "", body: "", deepLink: "" },
  });

  const titleValue = watch("title");
  const bodyValue = watch("body");

  const segment = buildSegment(mode, tier, sub, days);

  const estimateMut = useMutation({
    mutationFn: () =>
      env.useFixtures
        ? Promise.resolve({ userCount: 0, tokenCount: 0 })
        : callApi("ESTIMATE_PUSH_AUDIENCE", { payload: { segment: segment! } }),
    onSuccess: (data) => setEstimate(data),
    onError: (e) => toast.error(isApiError(e) ? e.message : "Estimate failed."),
  });

  const createMut = useMutation({
    mutationFn: (values: FormValues) =>
      env.useFixtures
        ? Promise.resolve({
            campaign: {
              id: `fixture-campaign-${Date.now()}`,
              title: values.title,
              body: values.body,
              deepLink: values.deepLink?.trim() || null,
              status: "draft",
              segment: segment!,
              recipientCount: 0,
              sentCount: 0,
              failedCount: 0,
              createdByAdminEmail: "fixture@beorchid.com",
              createdAt: new Date().toISOString(),
              scheduledAt: null,
              sentAt: null,
            } satisfies PushCampaignRow,
          } as EndpointResponse<"CREATE_PUSH_CAMPAIGN">)
        : callApi("CREATE_PUSH_CAMPAIGN", {
            payload: {
              title: values.title,
              body: values.body,
              deepLink: values.deepLink?.trim() || undefined,
              segment: segment!,
            },
          }),
    onSuccess: (result) => {
      if (env.useFixtures) {
        qc.setQueriesData<EndpointResponse<"LIST_PUSH_CAMPAIGNS">>(
          { queryKey: ["push", "campaigns"] },
          (current) =>
            current ? { ...current, items: [result.campaign, ...current.items] } : current
        );
      }
      toast.success("Campaign created (draft).");
      if (!env.useFixtures) void qc.invalidateQueries({ queryKey: ["push"], exact: false });
      onOpenChange(false);
      reset();
      setMode("all");
      setTier("any");
      setSub("any");
      setDays("");
      setEstimate(null);
      setSegmentError(null);
    },
    onError: (e) => toast.error(isApiError(e) ? e.message : "Create failed."),
  });

  const onSubmit = handleSubmit((values) => {
    if (segment === null) {
      setSegmentError("Select at least one filter or choose Everyone.");
      return;
    }
    setSegmentError(null);
    createMut.mutate(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New push campaign</DialogTitle>
          <DialogDescription>
            Creates a draft. Sending is a separate, audited step.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="c-title">Title</Label>
              <span className="text-xs text-muted-foreground">{titleValue?.length ?? 0}/120</span>
            </div>
            <Input id="c-title" maxLength={120} {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="c-body">Body</Label>
              <span className="text-xs text-muted-foreground">{bodyValue?.length ?? 0}/500</span>
            </div>
            <Textarea id="c-body" maxLength={500} {...register("body")} />
            {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-link">Deep link (optional)</Label>
            <Input id="c-link" placeholder="thrivo://…" {...register("deepLink")} />
          </div>

          <div className="space-y-1.5">
            <Label>Audience</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={mode === "all" ? "default" : "outline"}
                onClick={() => {
                  setMode("all");
                  setSegmentError(null);
                }}
              >
                Everyone
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "filters" ? "default" : "outline"}
                onClick={() => setMode("filters")}
              >
                By filter
              </Button>
            </div>
          </div>

          {mode === "filters" && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subscription</Label>
                <Select value={sub} onValueChange={setSub}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="c-days">Active within (days)</Label>
                <Input
                  id="c-days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>
            </div>
          )}

          {segmentError && <p className="text-xs text-destructive">{segmentError}</p>}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!segment || estimateMut.isPending}
              onClick={() => estimateMut.mutate()}
            >
              Estimate audience
            </Button>
            {estimate ? (
              <span className="text-sm text-muted-foreground">
                {estimate.userCount} users · {estimate.tokenCount} devices
              </span>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              Create draft
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
