# Frontend Setup Notes

## Monthly chart totals

Trend and monthly overview totals are grouped by each expense's date, not the
enclosing document's month key. The calculation uses the backend's local calendar
timezone, matching dashboard summaries. Empty trend months still show zero.
Deploy the backend for this correction; no stored expense records are modified.

## Expense date filters

On Expenses, open **Filter** to enter a start/end date or select one of the
12 month presets for the chosen year, then click **Apply filters**.
Either date can be left empty for an open-ended range. **Clear dates** removes
only the date filter; search and category selections stay unchanged.
Date bounds include the entire final day in the browser's local time zone.

## Dashboard month selection

Select a bar in the 6-Month Trend chart (or focus it and press Enter/Space) to
view that month's Top Categories and amounts. The selected month is highlighted;
the "This month" button resets the breakdown. The hero always shows this month's total.
The summary API accepts an optional `monthKey=yyyyMM`; requests without it still
return the current month. Deploy the backend update alongside the frontend.

Run `npm test` from `frontend` for dashboard interaction and month-filter API tests.

Files were generated with underscores in their names instead of directory
slashes because the file generator flattens paths. **Before running the
project**, recreate the folder structure by mapping each generated file to
its real path (drop the leading `src_` and replace remaining underscores
between path segments with `/`, keeping the final filename's own underscores
intact e.g. `useCreateExpense` stays camelCase):

```
src_index.css                                  -> src/index.css
src_main.tsx                                   -> src/main.tsx
src_App.tsx                                    -> src/App.tsx
src_vite-env.d.ts                              -> src/vite-env.d.ts
src_types_index.ts                             -> src/types/index.ts
src_api_client.ts                              -> src/api/client.ts
src_api_hooks_useExpenses.ts                   -> src/api/hooks/useExpenses.ts
src_api_hooks_useCategories.ts                 -> src/api/hooks/useCategories.ts
src_api_hooks_useDashboard.ts                  -> src/api/hooks/useDashboard.ts
src_store_uiStore.ts                           -> src/store/uiStore.ts
src_utils_format.ts                            -> src/utils/format.ts
src_utils_categoryColors.ts                    -> src/utils/categoryColors.ts
src_components_ui_Button.tsx                   -> src/components/ui/Button.tsx
src_components_ui_Card.tsx                     -> src/components/ui/Card.tsx
src_components_ui_Chip.tsx                     -> src/components/ui/Chip.tsx
src_components_ui_ProgressBar.tsx              -> src/components/ui/ProgressBar.tsx
src_components_ui_Skeleton.tsx                 -> src/components/ui/Skeleton.tsx
src_components_ui_BottomSheet.tsx              -> src/components/ui/BottomSheet.tsx
src_components_layout_MobileShell.tsx          -> src/components/layout/MobileShell.tsx
src_components_layout_BottomNav.tsx            -> src/components/layout/BottomNav.tsx
src_components_layout_TopHeader.tsx            -> src/components/layout/TopHeader.tsx
src_components_expenses_ExpenseCard.tsx        -> src/components/expenses/ExpenseCard.tsx
src_components_expenses_ExpenseList.tsx        -> src/components/expenses/ExpenseList.tsx
src_components_expenses_ExpenseForm.tsx        -> src/components/expenses/ExpenseForm.tsx
src_components_expenses_CategoryPicker.tsx     -> src/components/expenses/CategoryPicker.tsx
src_components_charts_PieBreakdown.tsx         -> src/components/charts/PieBreakdown.tsx
src_components_charts_TrendChart.tsx           -> src/components/charts/TrendChart.tsx
src_pages_DashboardPage.tsx                    -> src/pages/DashboardPage.tsx
src_pages_ExpensesPage.tsx                     -> src/pages/ExpensesPage.tsx
src_pages_CategoriesPage.tsx                   -> src/pages/CategoriesPage.tsx
src_routes_AppRoutes.tsx                       -> src/routes/AppRoutes.tsx
```

Root-level files (`package.json`, `vite.config.ts`, `tailwind.config.js`,
`postcss.config.js`, `tsconfig.json`, `.env`, `index.html`) stay at
the project root as-is.

## Install & run

```bash
npm install
cp ..env .env.local   # fill in VITE_API_BASE_URL and VITE_API_KEY
npm run dev
```

Requires the backend from Phase 2 running locally (default
`http://localhost:4000/api`) with a matching `API_SECRET` value in both
`.env` files.

## What's implemented

- **Dashboard** (`/`): hero card with month total + budget progress, top-5
  category pie chart, 6-month trend area chart — all backed by your
  aggregation endpoints (`/dashboard/summary`, `/dashboard/trend`).
- **Expenses** (`/expenses`): searchable, category-filterable list grouped
  by day, swipe-left-to-delete, tap-to-edit.
- **Categories** (`/categories`): per-category spend vs. threshold, ported
  from `CategorySpendingScreen.kt`.
- **Add/Edit** via a bottom sheet reachable from the FAB in the bottom nav
  on any screen (`ExpenseForm`), using the shared `POST/PATCH/DELETE
  /api/expenses` endpoints from Phase 2.
- **State management**: TanStack Query owns all server data (with
  optimistic delete for the swipe gesture); Zustand only holds small UI
  state (active sheet, editing target, period toggle, category filter).
- **PWA**: `vite-plugin-pwa` is wired in `vite.config.ts` so the app is
  installable on a phone home screen; add real `icon-192.png` /
  `icon-512.png` files to `public/` before shipping.

## Next steps you'll likely want

1. Add a `/api/categories` route on the backend returning
   `{ categories: EXPENSE_CATEGORIES }` (referenced by `useCategories`).
2. Add `budget` to `/api/dashboard/summary` and `budgetThreshold` per
   category to `/api/dashboard/category-spending` if you want the progress
   bars to be functional (they render conditionally and simply hide if the
   fields are absent).
3. Add `public/icon-192.png`, `public/icon-512.png`, and `public/favicon.svg`
   for the PWA manifest referenced in `vite.config.ts`.
