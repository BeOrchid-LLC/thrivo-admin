"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { AuthAlert, AuthCard, AuthField, AuthSubmitButton } from "@/components/auth/AuthUI";
import { getClerkErrorsMessage, getErrorMessage } from "@/components/auth/auth-utils";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const busy = fetchStatus === "fetching";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    await signIn.reset();
    let result = await signIn.create({ identifier: email });
    if (result.error) {
      setMessage(getErrorMessage(result.error, errors));
      return;
    }

    result = await signIn.resetPasswordEmailCode.sendCode();
    if (result.error) {
      setMessage(getErrorMessage(result.error, errors));
      return;
    }

    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your staff email and we’ll send a verification code to reset your password."
      footer={
        <Link href="/login" className="w-full">
          <Button type="button" variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Button>
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={submit}>
        <AuthAlert message={message || getClerkErrorsMessage(errors)} />
        <AuthField
          id="email"
          label="Email address"
          value={email}
          onChange={setEmail}
          placeholder="Enter your email"
          autoComplete="email"
          autoFocus
          disabled={busy}
        />
        <AuthSubmitButton loading={busy}>
          <Mail className="h-4 w-4" />
          Send reset code
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
