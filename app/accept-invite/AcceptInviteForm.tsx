"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import {
  AuthAlert,
  AuthCard,
  AuthCodeField,
  AuthField,
  AuthSubmitButton,
} from "@/components/auth/AuthUI";
import { getClerkErrorsMessage, getErrorMessage } from "@/components/auth/auth-utils";
import { Button } from "@/components/ui/button";

export function AcceptInviteForm() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const ticket = useSearchParams().get("__clerk_ticket");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"form" | "email-code">("form");
  const [message, setMessage] = useState<string | null>(null);
  const busy = fetchStatus === "fetching";

  async function finalize() {
    const { error } = await signUp.finalize();
    if (error) {
      setMessage(getErrorMessage(error));
      return;
    }
    window.location.assign("/dashboard");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (!ticket) {
      setMessage(
        "This invitation link is missing its Clerk ticket. Ask an administrator to send a new invitation."
      );
      return;
    }
    const { error } = await signUp.ticket({
      ticket,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
    });
    if (error) {
      setMessage(getErrorMessage(error, errors));
      return;
    }
    if (signUp.status === "complete") {
      await finalize();
      return;
    }

    if (signUp.unverifiedFields.includes("email_address")) {
      const verification = await signUp.verifications.sendEmailCode();
      if (verification.error) {
        setMessage(getErrorMessage(verification.error));
        return;
      }
      setStage("email-code");
      return;
    }

    setMessage(
      `More information is required: ${signUp.missingFields.join(", ") || "please try again"}.`
    );
  }

  async function verifyEmail(submittedCode = code, event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setMessage(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code: submittedCode });
    if (error) {
      setMessage(getErrorMessage(error, errors));
      return;
    }
    await finalize();
  }

  if (stage === "email-code") {
    return (
      <AuthCard
        title="Verify your invitation"
        description={`Enter the six-digit code sent to ${signUp.emailAddress || "your invited email address"}.`}
        footer={
          <p className="text-center text-sm text-muted-foreground">
            This code confirms the email address that received the invitation.
          </p>
        }
      >
        <form className="space-y-6" onSubmit={(event) => void verifyEmail(code, event)}>
          <AuthAlert message={message || getClerkErrorsMessage(errors)} />
          <AuthCodeField
            description="The code expires soon. Request a new invitation if it is no longer valid."
            onComplete={(nextCode) => {
              setCode(nextCode);
              void verifyEmail(nextCode);
            }}
            disabled={busy}
          />
          <AuthSubmitButton loading={busy} disabled={code.length !== 6}>
            Verify invitation
          </AuthSubmitButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Accept your invitation"
      description="Set up your Thrivo Admin account using the invitation from your administrator."
      footer={
        <Link href="/login" className="w-full">
          <Button type="button" variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Already have an account? Sign in
          </Button>
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={submit}>
        <AuthAlert message={message || getClerkErrorsMessage(errors)} />
        {!ticket ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            Invitation required. Open the invitation link from your email to continue.
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            id="first-name"
            label="First name"
            value={firstName}
            onChange={setFirstName}
            placeholder="First name"
            autoComplete="given-name"
            disabled={busy}
          />
          <AuthField
            id="last-name"
            label="Last name"
            value={lastName}
            onChange={setLastName}
            placeholder="Last name"
            autoComplete="family-name"
            disabled={busy}
          />
        </div>
        <div id="clerk-captcha" className="min-h-px" />
        <AuthSubmitButton loading={busy} disabled={!ticket}>
          <UserPlus className="h-4 w-4" />
          Accept invitation
        </AuthSubmitButton>
      </form>
    </AuthCard>
  );
}
