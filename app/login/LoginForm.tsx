"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { callApi, isApiError } from "@/lib/api";
import {
  adminPasswordLoginPayloadSchema,
  requestOtpPayload,
  ADMIN_PASSWORD_MIN,
  type AdminPasswordLoginPayload,
  type RequestOtpPayload,
} from "@/lib/contracts";
import { useAuthStore } from "@/lib/store/useAuthStore";

type Step = "password" | "otp-email" | "otp-verify";

const passwordFormSchema = adminPasswordLoginPayloadSchema;

const otpEmailSchema = requestOtpPayload;

const confirmPasswordSchema = z
  .object({ password: z.string(), confirm: z.string() })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
void confirmPasswordSchema; // used on reset pages, kept for type export

export function LoginForm() {
  const setAdmin = useAuthStore((s) => s.setAdmin);
  const [step, setStep] = useState<Step>("password");
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const passwordForm = useForm<AdminPasswordLoginPayload>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const otpEmailForm = useForm<RequestOtpPayload>({
    resolver: zodResolver(otpEmailSchema),
    defaultValues: { email: "" },
  });

  // ---- Password login ----
  const onPasswordLogin = passwordForm.handleSubmit(async (values) => {
    try {
      const { admin } = await callApi("LOGIN", { payload: values });
      setAdmin(admin);
    } catch (error) {
      handleAuthError(error);
    }
  });

  // ---- OTP: request code ----
  const onOtpRequest = otpEmailForm.handleSubmit(async (values) => {
    try {
      await callApi("REQUEST_OTP", { payload: values });
      setOtpEmail(values.email);
      setStep("otp-verify");
      toast.success("Code sent — check your email.");
    } catch (error) {
      handleAuthError(error);
    }
  });

  // ---- OTP: resend ----
  async function onResend() {
    if (!otpEmail || resendCooldown > 0) return;
    try {
      await callApi("REQUEST_OTP", { payload: { email: otpEmail } });
      toast.success("New code sent.");
      startCooldown();
    } catch (error) {
      handleAuthError(error);
    }
  }

  function startCooldown() {
    setResendCooldown(60);
    const id = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  // ---- OTP: verify ----
  async function onVerify(code: string) {
    if (!otpEmail || verifying) return;
    setVerifying(true);
    try {
      const { admin } = await callApi("VERIFY_OTP", { payload: { email: otpEmail, code } });
      setAdmin(admin);
    } catch (error) {
      handleAuthError(error);
      setVerifying(false);
    }
  }

  // ---- Render ----

  if (step === "otp-email") {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in with a code</CardTitle>
          <CardDescription>We&apos;ll email you a one-time login code.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onOtpRequest} className="space-y-4">
            <TextField
              control={otpEmailForm.control}
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@beorchid.com"
            />
            <Button type="submit" className="w-full" disabled={otpEmailForm.formState.isSubmitting}>
              {otpEmailForm.formState.isSubmitting ? "Sending…" : "Send code"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setStep("password")}
            >
              Back to password sign-in
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === "otp-verify") {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Enter your code</CardTitle>
          <CardDescription>Code sent to {otpEmail}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Verification code</Label>
            <OtpInput onComplete={onVerify} disabled={verifying} className="justify-center" />
            {verifying && <p className="text-center text-xs text-muted-foreground">Verifying…</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onResend}
              disabled={resendCooldown > 0 || verifying}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("password");
                setOtpEmail(null);
              }}
              disabled={verifying}
            >
              Back to password sign-in
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default: password step
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Sign in with your staff credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onPasswordLogin} className="space-y-4">
          <TextField
            control={passwordForm.control}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@beorchid.com"
          />
          <div className="space-y-1">
            <TextField
              control={passwordForm.control}
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder={`Min ${ADMIN_PASSWORD_MIN} characters`}
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep("otp-email")}
          >
            Email me a code instead
          </Button>
        </form>
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
