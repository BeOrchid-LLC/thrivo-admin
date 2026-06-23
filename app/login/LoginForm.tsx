"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { callApi, isApiError } from "@/lib/api";
import { requestOtpPayload, type RequestOtpPayload } from "@/lib/contracts";
import { useAuthStore } from "@/lib/store/useAuthStore";

export function LoginForm() {
  const setAdmin = useAuthStore((s) => s.setAdmin);
  const [email, setEmail] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const emailForm = useForm<RequestOtpPayload>({
    resolver: zodResolver(requestOtpPayload),
    defaultValues: { email: "" },
  });

  const onRequest = emailForm.handleSubmit(async (values) => {
    try {
      await callApi("REQUEST_OTP", { payload: values });
      setEmail(values.email);
      toast.success("Code sent — check your email.");
    } catch (error) {
      handleAuthError(error);
    }
  });

  async function onVerify(code: string) {
    if (!email || verifying) return;
    setVerifying(true);
    try {
      const { admin } = await callApi("VERIFY_OTP", { payload: { email, code } });
      // Updating the store triggers the SessionProvider useEffect which navigates to /dashboard.
      setAdmin(admin);
    } catch (error) {
      handleAuthError(error);
      setVerifying(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
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
                autoComplete="email"
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
              {emailForm.formState.isSubmitting ? "Sending…" : "Send code"}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Verification code</Label>
              <OtpInput onComplete={onVerify} disabled={verifying} className="justify-center" />
              {verifying && <p className="text-center text-xs text-muted-foreground">Verifying…</p>}
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setEmail(null)}
              disabled={verifying}
            >
              Use a different email
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function handleAuthError(error: unknown) {
  if (isApiError(error) && error.code === "NETWORK") {
    toast.error("Backend not connected yet.");
    return;
  }
  toast.error(isApiError(error) ? error.message : "Something went wrong.");
}
