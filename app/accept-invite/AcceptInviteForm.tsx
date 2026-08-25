"use client";

import { SignUp } from "@clerk/nextjs";

/** Clerk consumes the invitation ticket from the URL and completes signup. */
export function AcceptInviteForm() {
  return <SignUp />;
}
