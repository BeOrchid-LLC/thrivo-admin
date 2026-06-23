import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Thrivo Admin",
  description: "Internal operations console for Thrivo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <ReactQueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
