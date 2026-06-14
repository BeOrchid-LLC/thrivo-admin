import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thrivo Admin",
  description: "Internal operations console for Thrivo",
};

// Providers (TanStack Query, Toaster) are mounted here in Phase 3.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
