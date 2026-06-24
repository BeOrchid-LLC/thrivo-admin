# Admin patterns — Thrivo Admin

Companion to [`ui-principles.md`](./ui-principles.md). Describes how pages, data, and layout are structured.

## Page shell (RSC)

Protected routes are **thin server components**:

- `export const metadata` (or `generateMetadata`)
- Render a single section component — **no** `prefetchQuery`, `HydrationBoundary`, or `callServerApi`

```tsx
export default function UsersPage() {
  return (
    <Suspense fallback={<TableContentSkeleton />}>
      <UsersSection />
    </Suspense>
  );
}
```

Use `<Suspense>` when the section calls `useSearchParams()` (URL-backed filters).

## Section layout (client)

1. **Static chrome** — `PageHeader`, filter toolbars, action buttons (always visible)
2. **`QueryBoundary`** per independent data block — skeleton fallback + per-block error recovery
3. **Leaf component** — `useSuspenseQuery` + `callApi` (`credentials: "include"`)

Fixture data: wrap the live fetcher in `resolveData(fixture, () => callApi(...))` inside the `queryFn`.

## Lists

| Concern | Pattern |
| ------- | ------- |
| Filters | `useUrlListFilters()` — `status`, `q`, `page` synced via `history.replaceState` |
| Status UI | Radix `Tabs` (not `Select`) for low-cardinality filters |
| Search | Local input + `useDebounce` → URL `q` param |
| Filter transition | Parent `opacity-60` while `useUrlListFilters().isPending` |
| Table | `DataTable` with column `meta`, `TruncatedCell`, optional `renderMobileCard` |
| Row actions | `ActionsMenu` / entity wrapper (e.g. `UserActionsMenu`) — `MoreVertical` dropdown, not inline delete icons |
| Refresh | Icon button beside export; `queryClient.invalidateQueries` + `useIsFetching` disable state |
| Pagination | Server page numbers via `TablePagination` (backend contract) |

## Detail drawer

Use `DetailsDrawer` + `TableRowDetailsFooter` (loads-dashboard pattern):

- **Body** — entity cards / fields
- **Footer left** — `ActionsMenu` (entity-specific wrapper, `align="start"`)
- **Footer right** — **View Metadata** toggles JSON tab with copy support (`MetaHeader` / `MetaContent` / `MetaFooter`)
- Destructive actions (e.g. hard delete) live in the actions menu and open a confirmation dialog at section level

## Forms

Use `components/form/` atoms (`TextField`, `TextAreaField`) with react-hook-form + Zod.

## Shell

- Collapsible sidebar (`SidebarProvider`, cookie-persisted, Ctrl/Cmd+B)
- Mobile nav via `MobileSidebar` (Sheet)
- Grouped nav in `lib/navigation.ts`
- Theme toggle in `ProfileMenu` (`next-themes`)

## Commands

```bash
npm run checks      # typecheck + lint + format + build
npm run test        # unit/component (Vitest)
npm run test:e2e    # Playwright smoke (starts dev server on :3001)
```
