"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { adminRoleV2Schema, type AdminAccount, type AdminRoleV2 } from "@/lib/contracts";

const ROLE_OPTIONS: { value: AdminRoleV2; label: string }[] = [
  { value: "super-admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "support", label: "Support" },
  { value: "read-only", label: "Read-only" },
];

const formSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: adminRoleV2Schema.optional(),
});
type FormValues = z.infer<typeof formSchema>;

interface Props {
  admin: AdminAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAdminDialog({ admin, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", role: undefined },
  });

  useEffect(() => {
    if (admin) {
      form.reset({ name: admin.name ?? "", role: admin.role });
    }
  }, [admin, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!admin) return;
    try {
      await callApi("UPDATE_ADMIN", { params: { id: admin.id }, payload: values });
      toast.success("Admin updated.");
      await queryClient.invalidateQueries({ queryKey: queryKeys.admins.list() });
      onOpenChange(false);
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Failed to update admin.");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField control={form.control} name="name" label="Name" placeholder="Full name" />
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.watch("role") ?? ""}
              onValueChange={(v) =>
                form.setValue("role", v as AdminRoleV2, { shouldValidate: true })
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
              {form.formState.isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
