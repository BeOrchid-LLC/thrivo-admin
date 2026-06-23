import type { ReactNode } from "react";
import ThrivoLogo from "@/components/icons/ThrivoLogo";

type AuthLayoutProps = {
  children: ReactNode;
  subtitle?: string;
};

export default function AuthLayout({ children, subtitle = "Admin Dashboard" }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-muted/40 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-fit flex-col items-center">
        <div className="mb-6 flex items-center justify-center">
          <ThrivoLogo className="h-12 w-12" />
        </div>
        <h2 className="text-center text-2xl font-semibold tracking-tight text-foreground">
          {subtitle}
        </h2>
      </div>

      <div className="w-full max-w-md space-y-8">{children}</div>

      <div className="w-full space-y-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Beorchid. All rights reserved.
        </p>
      </div>
    </main>
  );
}
