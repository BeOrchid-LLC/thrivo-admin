import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AppProviders } from "@/components/providers/AppProviders";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME, APPLE_WEB_APP_TITLE, DEFAULT_DESCRIPTION, SITE_TITLE } from "@/lib/seo/site";

const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });

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
    <ClerkProvider
      signInUrl="/login"
      signInFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/login"
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${sans.variable} min-h-dvh overflow-hidden font-sans antialiased bg-background text-foreground`}
        >
          <AppProviders>
            <ReactQueryProvider>
              <SessionProvider>{children}</SessionProvider>
            </ReactQueryProvider>
          </AppProviders>
          <Toaster />
          <NextTopLoader color="#27AE60" height={3} showSpinner={false} />
        </body>
      </html>
    </ClerkProvider>
  );
}
