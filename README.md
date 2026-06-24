# thrivo-admin

Internal operations console for Thrivo — user management, subscription & funnel
analytics, the psychology tip bank, and email/audit logs. An **API consumer**:
it never touches the database; all data flows through the backend's
`/api/v1/admin/*` surface. See [`../docs/ADMIN_ARCHITECTURE.md`](../docs/ADMIN_ARCHITECTURE.md).

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind 3 + shadcn-style UI ·
TanStack Query + Table · Recharts · react-hook-form + Zod · TypeScript (strict).
Visual structure (shell, tables) adapted from `pinpoint-admin`; theme uses Thrivo
tokens.

## Getting started

```bash
npm install --legacy-peer-deps    # React 19 peer ranges
cp .env.example .env
npm run dev                        # http://localhost:3001
```

### Env flags

| Var | Default | Purpose |
|-----|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend base; admin calls `/api/v1/admin/*`. |
| `NEXT_PUBLIC_USE_FIXTURES` | `1` | Render tables/charts from local fixtures until the backend admin endpoints exist. Set `0` for live data. |
| `ADMIN_DEV_BYPASS` | `1` (non-prod) | Skip the session/role check so the UI is reviewable without the backend. Set `0` to enforce. **Remove once auth is wired.** |

> With the defaults you can browse every screen populated by fixtures and no
> backend running.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run test        # vitest run
npm run checks      # typecheck + lint + format:check + build
```

## Project structure

```
app/
  layout.tsx                 # root: ReactQuery provider + Toaster
  login/page.tsx             # staff email-OTP login
  (protected)/               # auth-gated group
    layout.tsx               # requireAdmin() -> DashboardLayout
    dashboard . users . users/[id] . subscriptions . analytics . content . emails . audit
middleware.ts                # edge session gate (dev-permissive)
components/
  ui/                        # shadcn-style primitives (Thrivo tokens)
  layout/                    # DashboardLayout, AppSidebar, DashboardHeader
  general/                   # DataTable, FilterableDataPage, PageHeader, MetricCard, states
  charts/                    # TrendChart, CategoryBar, CohortGrid (recharts)
  sections/<area>/           # page sections (client) + columns + dialogs
lib/
  api/                       # endpoints contract, callApi (client), errors, query-keys
  contracts/                 # local admin DTOs until backend admin schemas land
  fixtures/                  # labeled mock data + resolveData (USE_FIXTURES seam)
  query/ . auth.ts . config/env.ts . navigation.ts . format.ts . utils.ts
```

### The endpoints contract

`lib/api/endpoints.ts` declares every live/prepared route in one typed `ENDPOINTS` object
(path, method, `auth` flag, request/response Zod schemas); request/response
**types are inferred from the schemas**. `callApi` (client, `credentials: "include"`) is the
primary fetcher for all admin data. Responses are validated against the contract and throw a typed
`ApiError`. A legacy `callServerApi` exists for rare server-only use but protected pages do not
use it — see `docs/ui-principles.md`.
The shared `/users/me` contract is parsed from `@beorchid-llc/thrivo-contracts` (0.5.2+ adds
`isOnboardingSkipped` on `UserProfile` alongside `isOnboarded` and `onboardingStep`);
admin-only routes still use local fixture-backed DTOs until backend admin
endpoints and package schemas are published.

## Data flow

Protected pages are thin RSC shells (metadata + layout). Each data block is a client component
that fetches via `callApi`, wrapped in `QueryBoundary` (Suspense + error recovery). See
`docs/ui-principles.md`. While `USE_FIXTURES` is on, `queryFn` returns fixtures so the UI is fully
reviewable; flip it off and the same code calls the live API.

## Conventions

- No direct DB access — everything via `/api/v1/admin/*`.
- Client components fetch data; pages stay thin (no RSC prefetch).
- Every list is server-paginated/filtered; every mutation is Zod-validated and
  (server-side) audited.
- No hardcoded colors — Thrivo tokens via shadcn CSS variables.
- Layered auth: edge middleware + httpOnly session + server-side admin role check.

## Pending backend wiring

The backend admin endpoints don't exist yet. Current gaps are `GET_SESSION`,
staff OTP auth, user/subscription/analytics/content/email/audit routes, and all
mutations under `/api/v1/admin/*`; those remain fixture/local-contract backed.
When they land: set
`NEXT_PUBLIC_USE_FIXTURES=0` and `ADMIN_DEV_BYPASS=0`, wire `GET_SESSION` in
`lib/auth.ts`, and delete `lib/fixtures/`. E2E (Playwright) is deferred until then.
