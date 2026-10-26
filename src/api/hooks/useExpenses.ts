import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { apiClient } from "../client.ts";
import { ExpenseEntry, ExpenseFilters, PaginatedResponse } from "@/types";
import { getOutbox } from "@/offline/db";
import { applyOps } from "@/offline/overlay";
import { recordMutation } from "@/offline/syncEngine";

const EXPENSES_KEY = "expenses";

function buildParams(filters: ExpenseFilters) {
    const params: Record<string, string> = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.category) params.category = filters.category;
    if (filters.search) params.search = filters.search;
    params.page = String(filters.page ?? 1);
    params.limit = String(filters.limit ?? 50);
    return params;
}

export function useExpenses(filters: ExpenseFilters) {
    return useQuery({
        queryKey: [EXPENSES_KEY, filters],
        queryFn: async () => {
            const { data } = await apiClient.get<PaginatedResponse<ExpenseEntry>>("/expenses", {
                params: buildParams(filters),
            });
            return applyOps(data, await getOutbox(), filters);
        },
        placeholderData: (prev) => prev,
    });
}

/** Create/update/delete are queued locally and flushed in a batch by the sync engine. */
export function useCreateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Omit<ExpenseEntry, "expenseId">) => {
            const expenseId = uuid();
            await recordMutation(queryClient, "create", expenseId, payload);
            return { expenseId, ...payload };
        },
    });
}

export function useUpdateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            expenseId,
            updates,
        }: {
            expenseId: string;
            updates: Partial<Omit<ExpenseEntry, "expenseId">>;
        }) => {
            const current = queryClient
                .getQueriesData<PaginatedResponse<ExpenseEntry>>({ queryKey: [EXPENSES_KEY] })
                .flatMap(([, page]) => page?.data ?? [])
                .find((e) => e.expenseId === expenseId);
            if (!current) throw new Error("Expense is not loaded; refresh and try again");

            const { expenseId: _id, ...rest } = current;
            await recordMutation(queryClient, "update", expenseId, { ...rest, ...updates });
            return { success: true };
        },
    });
}

/**
 * Queues the delete. Row hide/undo is handled upstream by `useSoftDeleteExpense`,
 * which defers invoking this mutation until the undo grace period lapses.
 */
export function useDeleteExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (expenseId: string) => {
            await recordMutation(queryClient, "delete", expenseId);
            return { success: true };
        },
    });
}
