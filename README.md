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
  api/                       # endpoints contract, callApi (client) + callServerApi (RSC), errors, query-keys
  contracts/                 # local Zod DTOs (future @thrivo/contracts swap point)
  fixtures/                  # labeled mock data + resolveData (USE_FIXTURES seam)
  query/ . auth.ts . config/env.ts . navigation.ts . format.ts . utils.ts
```

### The endpoints contract

`lib/api/endpoints.ts` declares every admin route in one typed `ENDPOINTS` object
(path, method, `auth` flag, request/response Zod schemas); request/response
**types are inferred from the schemas**. Two fetchers consume it: `callApi`
(client, cookie-credentialed) for interactive tables/mutations, and
`callServerApi` (server-only, forwards the httpOnly session cookie) for the RSC
prefetch. Both validate responses against the contract and throw a typed `ApiError`.

## Data flow

Server Components prefetch initial page data into a QueryClient and hand it to the
client via `HydrationBoundary`; client sections read the same query key and take
over for filtering/pagination/polling. While `USE_FIXTURES` is on, both paths
return fixtures so the UI is fully reviewable; flip it off and the same code calls
the live API.

## Conventions

- No direct DB access — everything via `/api/v1/admin/*`.
- Server Components for initial data; client islands for interactivity.
- Every list is server-paginated/filtered; every mutation is Zod-validated and
  (server-side) audited.
- No hardcoded colors — Thrivo tokens via shadcn CSS variables.
- Layered auth: edge middleware + httpOnly session + server-side admin role check.

## Pending backend wiring

The backend admin endpoints don't exist yet. When they land: set
`NEXT_PUBLIC_USE_FIXTURES=0` and `ADMIN_DEV_BYPASS=0`, wire `GET_SESSION` in
`lib/auth.ts`, and delete `lib/fixtures/`. E2E (Playwright) is deferred until then.
