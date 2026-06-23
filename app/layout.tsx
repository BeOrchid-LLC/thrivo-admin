import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import {
  APP_NAME,
  APPLE_WEB_APP_TITLE,
  DEFAULT_DESCRIPTION,
  SITE_TITLE,
} from "@/lib/seo/site";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APPLE_WEB_APP_TITLE,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
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
