"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { callApi, isApiError } from "@/lib/api";

const RESEND_COOLDOWN_SEC = 60;

export function ResetPasswordSent() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);

  useEffect(() => {
    const id = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  async function handleResend() {
    if (cooldown > 0 || !email) return;
    try {
      await callApi("REQUEST_PASSWORD_RESET", { payload: { email } });
      toast.success("Reset link resent.");
    } catch (error) {
      if (isApiError(error) && error.code === "NETWORK") {
        toast.error("Backend not connected yet.");
        return;
      }
    }
    setCooldown(RESEND_COOLDOWN_SEC);
    const id = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          If <strong>{email || "that address"}</strong> belongs to a staff account, we sent a
          password reset link. The link expires in 30 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={handleResend} disabled={cooldown > 0} variant="outline" className="w-full">
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
        </Button>
        <Link
          href="/login"
          className="text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to sign-in
        </Link>
      </CardContent>
    </Card>
  );
}
