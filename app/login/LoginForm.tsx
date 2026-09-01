"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
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

type SignInStage = "credentials" | "email-code" | "mfa";
type MfaStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

const mfaLabels: Record<MfaStrategy, string> = {
  email_code: "Email code",
  phone_code: "Phone code",
  totp: "Authenticator app",
  backup_code: "Backup code",
};

export function LoginForm() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [method, setMethod] = useState<"password" | "email-code">("password");
  const [stage, setStage] = useState<SignInStage>("credentials");
  const [mfaStrategy, setMfaStrategy] = useState<MfaStrategy | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busy = fetchStatus === "fetching" || isSubmitting;

  function resetToCredentials(nextMethod = method) {
    void signIn.reset();
    setStage("credentials");
    setMfaStrategy(null);
    setCode("");
    setMessage(null);
    setIsSubmitting(false);
    setMethod(nextMethod);
  }

  async function finalize() {
    setIsSubmitting(true);
    const { error } = await signIn.finalize();
    if (error) {
      setIsSubmitting(false);
      setMessage(getErrorMessage(error));
      return;
    }

    window.location.assign("/dashboard");
  }

  async function beginMfa() {
    const available = signIn.supportedSecondFactors
      .map((factor) => factor.strategy)
      .filter((strategy): strategy is MfaStrategy =>
        ["email_code", "phone_code", "totp", "backup_code"].includes(strategy)
      );
    const selected = mfaStrategy && available.includes(mfaStrategy) ? mfaStrategy : available[0];

    if (!selected) {
      setIsSubmitting(false);
      setMessage(
        "Your account requires an additional verification method that is not available here."
      );
      return;
    }

    setMfaStrategy(selected);
    setStage("mfa");
    setCode("");

    if (selected === "email_code") {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) setMessage(getErrorMessage(error));
    } else if (selected === "phone_code") {
      const { error } = await signIn.mfa.sendPhoneCode();
      if (error) setMessage(getErrorMessage(error));
    }

    setIsSubmitting(false);
  }

  async function completeFirstFactor() {
    if (signIn.status === "complete") {
      await finalize();
      return;
    }

    if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      await beginMfa();
      return;
    }

    if (signIn.status === "needs_new_password") {
      setIsSubmitting(false);
      setMessage(
        "Your account needs a new password. Use the password reset link below to continue."
      );
      return;
    }

    setIsSubmitting(false);
    setMessage("Choose a supported sign-in method and try again.");
  }

  async function submitCredentials(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    if (method === "email-code") {
      const { error } = await signIn.emailCode.sendCode({ emailAddress: email });
      if (error) {
        setIsSubmitting(false);
        setMessage(getErrorMessage(error, errors));
        return;
      }
      setStage("email-code");
      setIsSubmitting(false);
      return;
    }

    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) {
      setIsSubmitting(false);
      setMessage(getErrorMessage(error, errors));
      return;
    }
    await completeFirstFactor();
  }

  async function verifyEmailCode(submittedCode = code, event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    const { error } = await signIn.emailCode.verifyCode({ code: submittedCode });
    if (error) {
      setIsSubmitting(false);
      setMessage(getErrorMessage(error, errors));
      return;
    }
    await completeFirstFactor();
  }

  async function verifyMfa(submittedCode = code, event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!mfaStrategy) return;
    setIsSubmitting(true);
    setMessage(null);

    const result =
      mfaStrategy === "email_code"
        ? await signIn.mfa.verifyEmailCode({ code: submittedCode })
        : mfaStrategy === "phone_code"
          ? await signIn.mfa.verifyPhoneCode({ code: submittedCode })
          : mfaStrategy === "totp"
            ? await signIn.mfa.verifyTOTP({ code: submittedCode })
            : await signIn.mfa.verifyBackupCode({ code: submittedCode });

    if (result.error) {
      setIsSubmitting(false);
      setMessage(getErrorMessage(result.error, errors));
      return;
    }
    await finalize();
  }

  if (stage === "email-code") {
    return (
      <AuthCard
        title="Check your email"
        description={`Enter the six-digit code we sent to ${email}.`}
        footer={
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={busy}
            onClick={() => resetToCredentials("email-code")}
          >
            <ArrowLeft className="h-4 w-4" />
            Use a different email
          </Button>
        }
      >
        <form className="space-y-6" onSubmit={(event) => void verifyEmailCode(code, event)}>
          <AuthAlert message={message || getClerkErrorsMessage(errors)} />
          <AuthCodeField
            description="The code expires soon. You can request a new one after trying again."
            onComplete={(nextCode) => {
              setCode(nextCode);
              void verifyEmailCode(nextCode);
            }}
            disabled={busy}
          />
          <AuthSubmitButton loading={busy} disabled={code.length !== 6}>
            Verify and sign in
          </AuthSubmitButton>
          <Button
            type="button"
            variant="link"
            className="h-auto w-full p-0"
            disabled={busy}
            onClick={async () => {
              setMessage(null);
              const { error } = await signIn.emailCode.sendCode();
              if (error) setMessage(getErrorMessage(error));
            }}
          >
            Resend code
          </Button>
        </form>
      </AuthCard>
    );
  }

  if (stage === "mfa") {
    const isCodeBased = mfaStrategy !== null;
    return (
      <AuthCard
        title="Verify your identity"
        description="Complete the additional security check to access Thrivo Admin."
        footer={
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={busy}
            onClick={() => resetToCredentials()}
          >
            <ArrowLeft className="h-4 w-4" />
            Start over
          </Button>
        }
      >
        <form className="space-y-6" onSubmit={(event) => void verifyMfa(code, event)}>
          <AuthAlert message={message || getClerkErrorsMessage(errors)} />
          {signIn.supportedSecondFactors.length > 1 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {signIn.supportedSecondFactors
                .map((factor) => factor.strategy)
                .filter((strategy): strategy is MfaStrategy => strategy in mfaLabels)
                .map((strategy) => (
                  <Button
                    key={strategy}
                    type="button"
                    variant={mfaStrategy === strategy ? "secondary" : "outline"}
                    disabled={busy}
                    onClick={async () => {
                      setMfaStrategy(strategy);
                      setCode("");
                      setMessage(null);
                      if (strategy === "email_code") await signIn.mfa.sendEmailCode();
                      if (strategy === "phone_code") await signIn.mfa.sendPhoneCode();
                    }}
                  >
                    {strategy === "totp" ? (
                      <ShieldCheck className="h-4 w-4" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    {mfaLabels[strategy]}
                  </Button>
                ))}
            </div>
          ) : null}
          {isCodeBased && mfaStrategy === "backup_code" ? (
            <AuthField
              id="backup-code"
              label="Backup code"
              value={code}
              onChange={setCode}
              placeholder="Enter your backup code"
              autoComplete="one-time-code"
              disabled={busy}
              autoFocus
            />
          ) : isCodeBased ? (
            <AuthCodeField
              description={
                mfaStrategy === "totp"
                  ? "Enter the code from your authenticator app."
                  : `Enter the ${mfaLabels[mfaStrategy!].toLowerCase()} sent to you.`
              }
              onComplete={(nextCode) => {
                setCode(nextCode);
                void verifyMfa(nextCode);
              }}
              disabled={busy}
            />
          ) : null}
          <AuthSubmitButton
            loading={busy}
            disabled={code.length !== (mfaStrategy === "backup_code" ? 1 : 6)}
          >
            Verify and sign in
          </AuthSubmitButton>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in with your Thrivo Admin credentials to continue."
      footer={
        <div className="flex w-full flex-col gap-3 text-center text-sm">
          <Link href="/forgot-password" className="text-primary underline-offset-4 hover:underline">
            Forgot your password?
          </Link>
          <p className="text-muted-foreground">
            Need access? Ask an existing administrator to send you an invitation.
          </p>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={submitCredentials}>
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
        {method === "password" ? (
          <AuthField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={busy}
          />
        ) : null}
        <AuthSubmitButton loading={busy}>
          {method === "password" ? "Sign in" : "Send sign-in code"}
        </AuthSubmitButton>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={busy}
          onClick={() => resetToCredentials(method === "password" ? "email-code" : "password")}
        >
          {method === "password" ? <Mail className="h-4 w-4" /> : <KeyRound className="h-4 w-4" />}
          {method === "password" ? "Use a one-time email code" : "Use a password instead"}
        </Button>
      </form>
    </AuthCard>
  );
}
