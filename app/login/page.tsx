"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { callApi, isApiError } from "@/lib/api";
import {
  requestOtpPayload,
  verifyOtpPayload,
  type RequestOtpPayload,
  type VerifyOtpPayload,
} from "@/lib/contracts";

/**
 * Staff login via email OTP (BetterAuth admin role). The backend auth routes are
 * not wired yet, so submission surfaces a friendly notice; the flow + validation
 * are in place for when REQUEST_OTP / VERIFY_OTP go live.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  const emailForm = useForm<RequestOtpPayload>({
    resolver: zodResolver(requestOtpPayload),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<VerifyOtpPayload>({
    resolver: zodResolver(verifyOtpPayload),
    defaultValues: { email: "", code: "" },
  });

  const onRequest = emailForm.handleSubmit(async (values) => {
    try {
      await callApi("REQUEST_OTP", { payload: values });
      setEmail(values.email);
      codeForm.setValue("email", values.email);
      toast.success("Code sent — check your email.");
    } catch (error) {
      handleAuthError(error);
    }
  });

  const onVerify = codeForm.handleSubmit(async (values) => {
    try {
      await callApi("VERIFY_OTP", { payload: values });
      router.push("/dashboard");
    } catch (error) {
      handleAuthError(error);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Thrivo Admin</CardTitle>
          <CardDescription>
            {email ? `Enter the code sent to ${email}` : "Sign in with your staff email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!email ? (
            <form onSubmit={onRequest} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@beorchid.com"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email ? (
                  <p className="text-xs text-destructive">
                    {emailForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                Send code
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  placeholder="123456"
                  {...codeForm.register("code")}
                />
                {codeForm.formState.errors.code ? (
                  <p className="text-xs text-destructive">
                    {codeForm.formState.errors.code.message}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={codeForm.formState.isSubmitting}>
                Verify & sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setEmail(null)}
              >
                Use a different email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function handleAuthError(error: unknown) {
  if (isApiError(error) && error.code === "NETWORK") {
    toast.error("Admin auth isn't connected yet. (Backend endpoints pending.)");
    return;
  }
  toast.error(isApiError(error) ? error.message : "Something went wrong.");
}
