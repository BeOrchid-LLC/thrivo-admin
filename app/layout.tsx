import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Thrivo Admin",
  description: "Internal operations console for Thrivo",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSession();
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <ReactQueryProvider>
          <SessionProvider initialAdmin={admin}>{children}</SessionProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
