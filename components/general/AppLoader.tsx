"use client";

import { Loader2 } from "lucide-react";
import ThrivoLogo from "@/components/icons/ThrivoLogo";

type AppLoaderProps = {
  message?: string;
};

/** Full-viewport branded loader for session init and auth guards. */
export function AppLoader({ message }: AppLoaderProps) {
  return (
    <main className="grid h-dvh w-full bg-background">
      <div className="grid h-full w-full place-items-center gap-5">
        <div className="flex flex-col items-center gap-5">
          <ThrivoLogo className="h-14 w-14" />
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        {message ? <p className="text-sm font-medium text-muted-foreground">{message}</p> : null}
      </div>
    </main>
  );
}
