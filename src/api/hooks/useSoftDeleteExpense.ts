import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ExpenseEntry, PaginatedResponse } from "@/types";
import { useDeleteExpense } from "./useExpenses";
import { usePendingDeleteStore } from "@/store/pendingDeleteStore";

const EXPENSES_KEY = "expenses";

type ExpensesCacheEntry = readonly [readonly unknown[], PaginatedResponse<ExpenseEntry> | undefined];

// Module-level (not a ref) so the snapshot survives even after the row that
// triggered the delete unmounts once it's filtered out of the visible list.
const cacheSnapshots = new Map<string, ExpensesCacheEntry[]>();

/**
 * Soft-delete flow for the Expenses page: hides the row immediately for a
 * responsive feel, but defers the real DELETE call for a grace period so an
 * accidental swipe/tap can be recovered via "Undo" before it's permanent.
 */
export function useSoftDeleteExpense() {
    const queryClient = useQueryClient();
    const deleteExpense = useDeleteExpense();
    const schedule = usePendingDeleteStore((s) => s.schedule);
    const cancel = usePendingDeleteStore((s) => s.cancel);

    const hideFromCache = useCallback(
        (expenseId: string) => {
            const snapshot = queryClient.getQueriesData<PaginatedResponse<ExpenseEntry>>({
                queryKey: [EXPENSES_KEY],
            });
            cacheSnapshots.set(expenseId, snapshot);
            snapshot.forEach(([key, value]) => {
                if (!value) return;
                queryClient.setQueryData(key, {
                    ...value,
                    data: value.data.filter((e) => e.expenseId !== expenseId),
                });
            });
        },
        [queryClient],
    );

    const scheduleDelete = useCallback(
        (expense: ExpenseEntry) => {
            hideFromCache(expense.expenseId);
            schedule(expense, (expenseId) => {
                cacheSnapshots.delete(expenseId);
                deleteExpense.mutate(expenseId);
            });
        },
        [hideFromCache, schedule, deleteExpense],
    );

    const undoDelete = useCallback(
        (expenseId: string) => {
            cancel(expenseId);
            cacheSnapshots.get(expenseId)?.forEach(([key, value]) => queryClient.setQueryData(key, value));
            cacheSnapshots.delete(expenseId);
        },
        [cancel, queryClient],
    );

    return { scheduleDelete, undoDelete };
}
