"use client";

import { SignIn } from "@clerk/nextjs";

/** Clerk owns password recovery and does not expose account existence. */
export function ForgotPasswordForm() {
  return <SignIn />;
}
