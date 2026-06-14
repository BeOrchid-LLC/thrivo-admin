"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { callApi, isApiError } from "@/lib/api";
import { upsertTipPayload, type Tip, type UpsertTipPayload } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MOODS = ["any", "great", "good", "okay", "low", "bad"] as const;

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
    defaultValues: { body: "", mood: null, isActive: true },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        body: tip?.body ?? "",
        mood: tip?.mood ?? null,
        isActive: tip?.isActive ?? true,
      });
    }
  }, [open, tip, form]);

  const body = form.watch("body");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tips"] });
  const onError = (error: unknown) => {
    if (isApiError(error) && error.code === "NETWORK") {
      toast.error("Saving needs the backend — not connected yet.");
    } else {
      toast.error(isApiError(error) ? error.message : "Could not save tip.");
    }
  };

  const mutation = useMutation({
    mutationFn: (payload: UpsertTipPayload) =>
      tip
        ? callApi("UPDATE_TIP", { params: { id: tip.id }, payload })
        : callApi("CREATE_TIP", { payload }),
    onSuccess: () => {
      toast.success(tip ? "Tip updated." : "Tip created.");
      void invalidate();
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
          <div className="space-y-1.5">
            <Label htmlFor="tip-body">Tip</Label>
            <Textarea id="tip-body" rows={3} {...form.register("body")} />
            {form.formState.errors.body ? (
              <p className="text-xs text-destructive">{form.formState.errors.body.message}</p>
            ) : null}
          </div>

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
            <Label>Preview</Label>
            <Card className="bg-muted/40">
              <CardContent className="p-4 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Thrivo Tip
                </p>
                <p className="text-foreground">{body || "Your tip will appear here…"}</p>
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
