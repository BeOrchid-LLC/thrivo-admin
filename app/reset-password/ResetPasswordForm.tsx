"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { callApi, isApiError } from "@/lib/api";
import { adminResetPasswordPayloadSchema, ADMIN_PASSWORD_MIN } from "@/lib/contracts";
import { useAuthStore } from "@/lib/store/useAuthStore";

const formSchema = z
  .object({
    password: z.string().min(ADMIN_PASSWORD_MIN, `Min ${ADMIN_PASSWORD_MIN} characters`),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type FormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const setAdmin = useAuthStore((s) => s.setAdmin);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    try {
      const payload = adminResetPasswordPayloadSchema.parse({ email, token, password });
      const { admin } = await callApi("RESET_PASSWORD", { payload });
      setAdmin(admin);
    } catch (error) {
      if (isApiError(error) && error.code === "NETWORK") {
        toast.error("Backend not connected yet.");
        return;
      }
      toast.error(isApiError(error) ? error.message : "Something went wrong.");
    }
  });

  // Non-dismissible invalid-link guard
  const isInvalid = !email || !token;

  return (
    <>
      {/* Non-dismissible dialog — user must request a new link */}
      <Dialog open={isInvalid} onOpenChange={() => {}}>
        <DialogContent
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="[&>button]:hidden"
        >
          <DialogHeader>
            <DialogTitle>Invalid reset link</DialogTitle>
            <DialogDescription>
              This password reset link is missing or malformed. Please request a new one.
            </DialogDescription>
          </DialogHeader>
          <Link href="/forgot-password">
            <Button className="w-full">Request a new link</Button>
          </Link>
        </DialogContent>
      </Dialog>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Set new password</CardTitle>
          <CardDescription>Choose a strong password for {email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <TextField
              control={form.control}
              name="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder={`Min ${ADMIN_PASSWORD_MIN} characters`}
            />
            <TextField
              control={form.control}
              name="confirm"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat new password"
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Setting password…" : "Set password & sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
