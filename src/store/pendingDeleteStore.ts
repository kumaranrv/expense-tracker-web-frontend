import { create } from "zustand";
import { ExpenseEntry } from "@/types";

/** Grace period before a soft-deleted expense is permanently removed. */
export const DELETE_GRACE_PERIOD_MS = 5000;

interface PendingDeleteEntry {
    expense: ExpenseEntry;
    expiresAt: number;
}

interface PendingDeleteState {
    pending: Record<string, PendingDeleteEntry>;
    timers: Record<string, ReturnType<typeof setTimeout>>;
    /** Stashes the expense and starts the grace-period timer that fires `onCommit` when it lapses. */
    schedule: (expense: ExpenseEntry, onCommit: (expenseId: string) => void) => void;
    /** Clears a pending deletion's timer, used both on undo and after a successful commit. */
    cancel: (expenseId: string) => void;
}

/**
 * App-wide record of expenses that are hidden from the UI but not yet
 * permanently deleted, so an "Undo" action can restore them within the
 * grace period. Recovery-critical state, so it lives outside any single
 * component's lifecycle.
 */
export const usePendingDeleteStore = create<PendingDeleteState>((set, get) => ({
    pending: {},
    timers: {},

    schedule: (expense, onCommit) => {
        const timer = setTimeout(() => {
            onCommit(expense.expenseId);
            get().cancel(expense.expenseId);
        }, DELETE_GRACE_PERIOD_MS);

        set((state) => ({
            pending: {
                ...state.pending,
                [expense.expenseId]: { expense, expiresAt: Date.now() + DELETE_GRACE_PERIOD_MS },
            },
            timers: { ...state.timers, [expense.expenseId]: timer },
        }));
    },

    cancel: (expenseId) => {
        set((state) => {
            const timer = state.timers[expenseId];
            if (timer) clearTimeout(timer);

            const pending = { ...state.pending };
            const timers = { ...state.timers };
            delete pending[expenseId];
            delete timers[expenseId];
            return { pending, timers };
        });
    },
}));
