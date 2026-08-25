"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError, queryKeys, type EndpointResponse } from "@/lib/api";
import { env } from "@/lib/config/env";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { TIP_MOODS, upsertTipPayload, type Tip, type UpsertTipPayload } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextAreaField } from "@/components/form";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOODS = ["any", ...TIP_MOODS] as const;

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Provided when editing; omitted to create. */
  tip?: Tip;
}

/** Create/edit a "Thrivo Tip" with a live preview. Mutations toast when the backend is pending. */
export function TipDialog({ open, onOpenChange, tip }: TipDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<UpsertTipPayload>({
    resolver: zodResolver(upsertTipPayload),
    defaultValues: { body: "", mood: null, isActive: true, pinnedDate: null },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        body: tip?.body ?? "",
        mood: tip?.mood ?? null,
        isActive: tip?.isActive ?? true,
        pinnedDate: tip?.pinnedDate ?? null,
      });
    }
  }, [open, tip, form]);

  const body = form.watch("body");

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.tips.list({ page: 1, pageSize: DEFAULT_PAGE_SIZE }),
      exact: false,
    });
  const onError = (error: unknown) => {
    if (isApiError(error) && error.code === "NETWORK") {
      toast.error("Saving failed because the live API is unavailable.");
    } else {
      toast.error(isApiError(error) ? error.message : "Could not save tip.");
    }
  };

  const mutation = useMutation({
    mutationFn: (payload: UpsertTipPayload) =>
      tip
        ? env.useFixtures
          ? Promise.resolve({})
          : callApi("UPDATE_TIP", { params: { id: tip.id }, payload })
        : env.useFixtures
          ? Promise.resolve({})
          : callApi("CREATE_TIP", { payload }),
    onSuccess: (_result, payload) => {
      toast.success(tip ? "Tip updated." : "Tip created.");
      if (env.useFixtures) {
        const nextTip: Tip = {
          id: tip?.id ?? `fixture-tip-${Date.now()}`,
          body: payload.body,
          mood: payload.mood ?? null,
          isActive: payload.isActive ?? true,
          pinnedDate: payload.pinnedDate ?? null,
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueriesData<EndpointResponse<"LIST_TIPS">>(
          { queryKey: queryKeys.tips.list({}), exact: false },
          (data) => {
            if (!data) return data;
            const items = tip
              ? data.items.map((item) => (item.id === tip.id ? nextTip : item))
              : [nextTip, ...data.items];
            return {
              ...data,
              items,
              pagination: {
                ...data.pagination,
                total: tip ? data.pagination.total : data.pagination.total + 1,
              },
            };
          }
        );
      } else {
        void invalidate();
      }
      onOpenChange(false);
    },
    onError,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{tip ? "Edit tip" : "New tip"}</DialogTitle>
          <DialogDescription>Labeled “Thrivo Tips” in the app — never “coach”.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <TextAreaField control={form.control} name="body" label="Tip" rows={3} />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Mood</Label>
              <Select
                value={form.watch("mood") ?? "any"}
                onValueChange={(v) =>
                  form.setValue("mood", v === "any" ? null : (v as Tip["mood"]))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select
                value={form.watch("isActive") ? "active" : "hidden"}
                onValueChange={(v) => form.setValue("isActive", v === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tip-pin-date">Pin to date (optional)</Label>
            <Input
              id="tip-pin-date"
              type="date"
              {...form.register("pinnedDate")}
              onChange={(e) => form.setValue("pinnedDate", e.target.value || null)}
            />
            <p className="text-xs text-muted-foreground">
              Pins this tip to a specific calendar day. Leave blank to rotate normally.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Preview</Label>
            <Card className="bg-muted/40">
              <CardContent className="p-4 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Thrivo Tip
                </p>
                <p className="text-foreground">{body || "Your tip will appear here…"}</p>
                {form.watch("pinnedDate") && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pinned: {form.watch("pinnedDate")}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {tip ? "Save changes" : "Create tip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
