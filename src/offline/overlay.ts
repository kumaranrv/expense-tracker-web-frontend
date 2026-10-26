import type { QueryClient } from "@tanstack/react-query";
import type { ExpenseEntry, ExpenseFilters, PaginatedResponse } from "@/types";
import type { OutboxOp } from "./db";

type Page = PaginatedResponse<ExpenseEntry>;

function matchesFilters(e: ExpenseEntry, f: ExpenseFilters): boolean {
    if (f.category && e.category !== f.category) return false;
    if (f.search && !e.description.toLowerCase().includes(f.search.toLowerCase())) return false;
    if (f.startDate && e.date < new Date(f.startDate).getTime()) return false;
    if (f.endDate && e.date > new Date(f.endDate).getTime()) return false;
    return true;
}

/**
 * Replays unsynced ops over a server page so refetches never hide local edits.
 * Creates only appear on page 1; updates and deletes apply wherever the row is.
 */
export function applyOps(page: Page, ops: OutboxOp[], filters: ExpenseFilters): Page {
    if (ops.length === 0) return page;
    const isFirstPage = (filters.page ?? 1) === 1;
    let rows = page.data;

    for (const op of ops) {
        const without = rows.filter((e) => e.expenseId !== op.expenseId);
        if (op.type === "delete") {
            rows = without;
            continue;
        }
        const entry: ExpenseEntry = { expenseId: op.expenseId, ...op.payload! };
        const existed = without.length !== rows.length;
        if (!matchesFilters(entry, filters)) rows = without;
        else if (existed || isFirstPage) rows = [...without, entry];
    }
    rows = [...rows].sort((a, b) => b.date - a.date);
    return { ...page, data: rows };
}

/** Immediately reflects freshly queued ops in every cached expenses list. */
export function patchCache(qc: QueryClient, ops: OutboxOp[]): void {
    qc.getQueriesData<Page>({ queryKey: ["expenses"] }).forEach(([key, page]) => {
        if (!page?.data) return;
        const filters = (key[1] ?? {}) as ExpenseFilters;
        qc.setQueryData(key, applyOps(page, ops, filters));
    });
}
