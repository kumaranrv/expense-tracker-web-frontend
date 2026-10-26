import { AnimatePresence, motion } from "framer-motion";
import { DELETE_GRACE_PERIOD_MS, usePendingDeleteStore } from "@/store/pendingDeleteStore";
import { useSoftDeleteExpense } from "@/api/hooks/useSoftDeleteExpense";
import { money } from "@/utils/format";

/**
 * Global recovery snackbar for the Expenses page: surfaces every
 * soft-deleted expense with an "Undo" action until its grace period lapses.
 */
export function UndoSnackbar() {
    const pending = usePendingDeleteStore((s) => s.pending);
    const { undoDelete } = useSoftDeleteExpense();
    const entries = Object.values(pending);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 mx-auto flex max-w-md flex-col gap-2 px-4 lg:bottom-6 lg:left-[clamp(14rem,16vw,17rem)]">
            <AnimatePresence>
                {entries.map(({ expense }) => (
                    <motion.div
                        key={expense.expenseId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="pointer-events-auto relative flex items-center justify-between overflow-hidden rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-3 text-sm text-white shadow-lg"
                    >
                        <span className="truncate">
                            Deleted "{expense.description}" ({money(expense.amount)})
                        </span>
                        <button
                            onClick={() => undoDelete(expense.expenseId)}
                            className="ml-3 shrink-0 font-semibold text-brand-300 active:opacity-70"
                        >
                            Undo
                        </button>
                        <motion.span
                            className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-400"
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: DELETE_GRACE_PERIOD_MS / 1000, ease: "linear" }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
