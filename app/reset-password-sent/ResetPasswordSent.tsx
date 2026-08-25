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
          Clerk will send recovery instructions if {email} belongs to a staff account. For another
          attempt, use the password recovery option on the sign-in screen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/login">
          <Button className="w-full">Back to sign-in</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
