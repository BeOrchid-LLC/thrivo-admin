"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError } from "@/lib/api";
import type { PushSegment } from "@/lib/contracts";
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
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [mode, setMode] = useState<"all" | "filters">("all");
  const [tier, setTier] = useState("any");
  const [sub, setSub] = useState("any");
  const [days, setDays] = useState("");
  const [estimate, setEstimate] = useState<{ userCount: number; tokenCount: number } | null>(null);

  const segment = buildSegment(mode, tier, sub, days);

  const estimateMut = useMutation({
    mutationFn: () => callApi("ESTIMATE_PUSH_AUDIENCE", { payload: { segment: segment! } }),
    onSuccess: (data) => setEstimate(data),
    onError: (e) => toast.error(isApiError(e) ? e.message : "Estimate failed."),
  });

  const createMut = useMutation({
    mutationFn: () =>
      callApi("CREATE_PUSH_CAMPAIGN", {
        payload: {
          title: title.trim(),
          body: body.trim(),
          deepLink: deepLink.trim() || undefined,
          segment: segment!,
        },
      }),
    onSuccess: () => {
      toast.success("Campaign created (draft).");
      void qc.invalidateQueries({ queryKey: ["push"], exact: false });
      onOpenChange(false);
      setTitle("");
      setBody("");
      setDeepLink("");
      setEstimate(null);
    },
    onError: (e) => toast.error(isApiError(e) ? e.message : "Create failed."),
  });

  const canSubmit = title.trim() && body.trim() && segment !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New push campaign</DialogTitle>
          <DialogDescription>
            Creates a draft. Sending is a separate, audited step.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="c-title">Title</Label>
            <Input
              id="c-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-body">Body</Label>
            <Textarea
              id="c-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-link">Deep link (optional)</Label>
            <Input
              id="c-link"
              value={deepLink}
              onChange={(e) => setDeepLink(e.target.value)}
              placeholder="thrivo://…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Audience</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={mode === "all" ? "default" : "outline"}
                onClick={() => setMode("all")}
              >
                Everyone
              </Button>
              <Button
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

          <div className="flex items-center gap-3">
            <Button
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit || createMut.isPending} onClick={() => createMut.mutate()}>
            Create draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
