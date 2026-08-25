"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { callApi, isApiError, queryKeys } from "@/lib/api";
import { env } from "@/lib/config/env";
import {
  adminInvitePayloadSchema,
  type AdminAccount,
  type AdminInvitePayload,
  type AdminListResponse,
} from "@/lib/contracts";

const ROLE_OPTIONS = [
  { value: "super-admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "support", label: "Support" },
  { value: "read-only", label: "Read-only" },
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteAdminDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const form = useForm<AdminInvitePayload>({
    resolver: zodResolver(adminInvitePayloadSchema),
    defaultValues: { email: "", name: "", role: "support" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (
      values.role === "super-admin" &&
      !window.confirm("Create a super-admin account with full administrative access?")
    ) {
      return;
    }
    try {
      if (env.useFixtures) {
        const now = new Date();
        const fixtureAdmin: AdminAccount = {
          id: crypto.randomUUID(),
          email: values.email,
          name: values.name,
          role: values.role,
          status: "invited",
          permissions: null,
          invitedByEmail: null,
          lastLoginAt: null,
          inviteExpiresAt: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
          inviteRevokedAt: null,
          createdAt: now.toISOString(),
        };
        queryClient.setQueryData<AdminListResponse>(queryKeys.admins.list(), (current) => ({
          items: [...(current?.items ?? []), fixtureAdmin],
        }));
      } else {
        await callApi("INVITE_ADMIN", { payload: values });
      }
      toast.success(`Invite sent to ${values.email}.`);
      if (!env.useFixtures) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.admins.list() });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Failed to send invite.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite admin</DialogTitle>
          <DialogDescription>Send a secure invitation to a new admin account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="off"
            placeholder="new-admin@beorchid.com"
          />
          <TextField control={form.control} name="name" label="Name" placeholder="Full name" />
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.watch("role")}
              onValueChange={(v) =>
                form.setValue("role", v as AdminInvitePayload["role"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
