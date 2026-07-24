# ── Stage 1: install dependencies ──────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Delete the Windows-generated lockfile and reinstall so Linux optional deps
# (e.g. @rollup/rollup-linux-x64-gnu) are resolved correctly.
RUN rm -f package-lock.json && npm install --no-audit --no-fund

# ── Stage 2: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time.
# Pass NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CLERK_FRONTEND_API_URL, and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as Coolify build variables.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://*.clerk.accounts.dev
ENV NEXT_PUBLIC_CLERK_FRONTEND_API_URL=${NEXT_PUBLIC_CLERK_FRONTEND_API_URL}
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

RUN npm run build

# ── Stage 3: runtime ────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# next build --output standalone copies only what the server needs.
COPY --from=builder /app/public                    ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Liveness from inside the container; use PORT (Coolify may override 3001).
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
