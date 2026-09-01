"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ResetPasswordSent() {
  const email = useSearchParams().get("email") ?? "that address";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          If {email} belongs to a staff account, we sent a password reset code. Enter it on the
          reset screen to choose a new password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
          <Button className="w-full">Enter reset code</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
