"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import {
  AuthAlert,
  AuthCard,
  AuthCodeField,
  AuthField,
  AuthSubmitButton,
} from "@/components/auth/AuthUI";
import { getClerkErrorsMessage, getErrorMessage } from "@/components/auth/auth-utils";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || signIn.identifier || "your email address";
  const [step, setStep] = useState<"code" | "password">("code");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const busy = fetchStatus === "fetching";

  useEffect(() => {
    if (signIn.status === "needs_new_password") setStep("password");
  }, [signIn.status]);

  async function verifyCode(submittedCode = code, event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setMessage(null);
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code: submittedCode });
    if (error) {
      setMessage(getErrorMessage(error, errors));
      return;
    }
    setStep("password");
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    if (password !== confirmation) {
      setMessage("The passwords do not match.");
      return;
    }

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password,
      signOutOfOtherSessions: true,
    });
    if (error) {
      setMessage(getErrorMessage(error, errors));
      return;
    }

    const finalized = await signIn.finalize();
    if (finalized.error) {
      setMessage(getErrorMessage(finalized.error));
      return;
    }
    window.location.assign("/dashboard");
  }

  if (!signIn.id && step === "code") {
    return (
      <AuthCard
        title="Reset link expired"
        description="Start a new password reset request to receive a fresh verification code."
        footer={
          <Link href="/forgot-password" className="w-full">
            <Button type="button" className="w-full">
              Request a new code
            </Button>
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          For your security, reset codes are tied to a single browser session.
        </p>
      </AuthCard>
    );
  }

  if (step === "code") {
    return (
      <AuthCard
        title="Enter your reset code"
        description={`Enter the six-digit code sent to ${email}.`}
        footer={
          <Link href="/forgot-password" className="w-full">
            <Button type="button" variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4" />
              Start over
            </Button>
          </Link>
        }
      >
        <form className="space-y-6" onSubmit={(event) => void verifyCode(code, event)}>
          <AuthAlert message={message || getClerkErrorsMessage(errors)} />
          <AuthCodeField
            description="The code expires soon. You can request another one if needed."
            onComplete={(nextCode) => {
              setCode(nextCode);
              void verifyCode(nextCode);
            }}
            disabled={busy}
          />
          <AuthSubmitButton loading={busy} disabled={code.length !== 6}>
            Verify reset code
          </AuthSubmitButton>
          <Button
            type="button"
            variant="link"
            className="h-auto w-full p-0"
            disabled={busy}
            onClick={async () => {
              setMessage(null);
              const { error } = await signIn.resetPasswordEmailCode.sendCode();
              if (error) setMessage(getErrorMessage(error));
            }}
          >
            Resend code
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create a new password"
      description="Choose a strong password for your Thrivo Admin account."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Resetting your password signs out other active sessions.
        </p>
      }
    >
      <form className="space-y-5" onSubmit={submitPassword}>
        <AuthAlert message={message || getClerkErrorsMessage(errors)} />
        <AuthField
          id="password"
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your new password"
          autoComplete="new-password"
          autoFocus
          disabled={busy}
        />
        <AuthField
          id="confirmation"
          label="Confirm new password"
          type="password"
          value={confirmation}
          onChange={setConfirmation}
          placeholder="Confirm your new password"
          autoComplete="new-password"
          disabled={busy}
        />
        <AuthSubmitButton loading={busy} disabled={!password || password !== confirmation}>
          <LockKeyhole className="h-4 w-4" />
          Update password
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
