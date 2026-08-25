"use client";

import { SignIn } from "@clerk/nextjs";

/** Clerk consumes the reset ticket and completes the password update. */
export function ResetPasswordForm() {
  return <SignIn />;
}
