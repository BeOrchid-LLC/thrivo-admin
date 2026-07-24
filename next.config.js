/** @type {import('next').NextConfig} */
const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const clerkFrontendApiUrl =
  process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL ?? "https://*.clerk.accounts.dev";

const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Pin file tracing to this app (the workspace has sibling lockfiles).
  outputFileTracingRoot: import.meta.dirname,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          // HSTS — enforces HTTPS regardless of API origin
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // CSP — connect-src includes the backend origin; tighten with nonces at launch.
          // script-src needs 'unsafe-eval' in dev only: Next's HMR/react-refresh
          // runtime evals module code, and without it the client JS throws on
          // load and the app never hydrates past the loading screen.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `connect-src 'self' ${apiOrigin} ${clerkFrontendApiUrl} https://clerk-telemetry.com https://*.clerk-telemetry.com https://*.protect.clerk.com`,
              `script-src 'self' 'unsafe-inline' ${clerkFrontendApiUrl} https://challenges.cloudflare.com https://*.protect.clerk.com${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://img.clerk.com",
              "worker-src 'self' blob:",
              "font-src 'self'",
              "frame-src 'self' https://challenges.cloudflare.com https://*.protect.clerk.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
