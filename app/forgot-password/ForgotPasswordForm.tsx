"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { callApi, isApiError } from "@/lib/api";
import {
  adminRequestPasswordResetPayloadSchema,
  type AdminRequestPasswordResetPayload,
} from "@/lib/contracts";

export function ForgotPasswordForm() {
  const router = useRouter();
  const form = useForm<AdminRequestPasswordResetPayload>({
    resolver: zodResolver(adminRequestPasswordResetPayloadSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await callApi("REQUEST_PASSWORD_RESET", { payload: values });
    } catch (error) {
      if (isApiError(error) && error.code === "NETWORK") {
        toast.error("Backend not connected yet.");
        return;
      }
    }
    // Always navigate to sent page — never reveal whether the email exists.
    router.push(`/reset-password-sent?email=${encodeURIComponent(values.email)}`);
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>
          Enter your staff email and we&apos;ll send a reset link if an account exists.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <TextField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@beorchid.com"
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
