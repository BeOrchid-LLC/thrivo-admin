# UI principles — Thrivo Admin

Adapted from the loads-dashboard / pinpoint-admin pattern. Generic building blocks live in
`components/general/` (`DataTable`, `QueryBoundary`, skeletons) and form atoms in `components/form/`.

## Graceful degradation

- No page-wide spinner for data. Each independently-loading block is wrapped in its own
  `<QueryBoundary>` (ErrorBoundary + Suspense), so blocks resolve — and fail — on their own.
- Static content (page headers, sidebar, filter toolbars) is never wrapped in a skeleton and renders
  immediately.
- Data already in the React Query cache renders with **no** skeleton when revisiting a page.
- Filter changes should run inside `useTransition` where possible so the previous list stays visible
  (dimmed) instead of flashing the skeleton.

## Data fetching

- **Client-only:** pages are thin RSC shells (metadata + layout). Leaf components fetch via `callApi`
  with `credentials: "include"` — no RSC `prefetchQuery` / `callServerApi`.
- Use `useSuspenseQuery` inside components wrapped by `QueryBoundary`.
- Fixture data is resolved in client `queryFn` via `resolveData()` when `NEXT_PUBLIC_USE_FIXTURES=1`.

## Tables & overflow

- Text cells truncate with an ellipsis; full values in a tooltip when they overflow (`TruncatedCell`).
- Status columns use compact badges with accessible labels.

## Responsiveness

- Below `md`, table rows become cards — no horizontal scrolling on phones.
- The sidebar collapses on desktop; below `md` it becomes a slide-over Sheet.

## Reuse

Extend shared components (`PageHeader`, `DataTable`, `QueryBoundary`) rather than duplicating markup in
feature sections under `components/sections/`.
