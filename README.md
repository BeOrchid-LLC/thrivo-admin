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

| Var                        | Default                 | Purpose                                                                                |
| -------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`      | `http://localhost:4000` | Backend base; admin calls `/api/v1/admin/*`.                                           |
| `NEXT_PUBLIC_USE_FIXTURES` | `1`                     | Use deterministic local data for every admin page and mutation. Set `0` for live data. |

> With the defaults you can browse every screen populated by fixtures without a
> backend. Clerk remains the authentication provider when the app is run live.

## Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run test        # vitest run
npm run checks      # typecheck + lint + format:check + build
npm run test:e2e    # Playwright auth shell smoke
```

The default Playwright run checks the Clerk authentication boundary without
credentials. For authenticated operational smoke coverage, create a storage
state for a dedicated non-production Clerk admin and set
`E2E_CLERK_STORAGE_STATE`; the `authenticated-actions.spec.ts` suite then runs
against fixture data by default. `E2E_CLERK_EMAIL` and `E2E_CLERK_PASSWORD`
enable the opt-in real sign-in check and should only be supplied through the
test environment.

The backend operational feature flags remain the release owner’s deployment
configuration. For the first unreleased-to-live deployment, configure the
internal push test recipients and enable the push test, push lifecycle, email
resend, and lead contact flags together; there is no staged rollout requirement.

## Project structure

```
app/
  layout.tsx                 # root: ReactQuery provider + Toaster
  login/page.tsx             # Clerk staff sign-in
  (protected)/               # auth-gated group
    layout.tsx               # UX-only loading gate; see ADR-0024 for the full auth model
    dashboard . users . users/[id] . subscriptions . analytics . content . emails . audit
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
The shared `/users/me` contract is parsed from `@beorchid-llc/thrivo-contracts`.
Admin-management and settings DTOs remain local until the next shared contract
package release; they mirror the backend Zod contracts.

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

## Admin capabilities

Global settings are managed at `/settings` by admins and super-admins. Admin
account lifecycle operations are restricted to super-admins and include Clerk
invitations, invitation revocation/resend, role changes, permission overrides,
and reversible disable/re-enable. The backend enforces the permission catalog;
sidebar visibility is UX-only.

Fixture mode is a complete local review mode. Live mode uses the mounted
`/api/v1/admin/*` endpoints and Clerk tokens. The legacy backend password/OTP
endpoints remain temporarily for migration compatibility but are not used by
the client invitation or password-reset pages.
