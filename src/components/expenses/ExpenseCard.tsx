import { motion } from "framer-motion";
import { ExpenseEntry } from "../../types";
import { money } from "../../utils/format";
import { categoryColor, categoryEmoji, categoryLabel } from "../../utils/categoryColors";
import { useSoftDeleteExpense } from "../../api/hooks/useSoftDeleteExpense";
import { useUIStore } from "../../store/uiStore";

interface ExpenseCardProps {
    expense: ExpenseEntry;
}

/** Swipe-left-to-delete row, tap to edit — mirrors native list-item gestures. */
export function ExpenseCard({ expense }: ExpenseCardProps) {
    const { scheduleDelete } = useSoftDeleteExpense();
    const setEditingExpenseId = useUIStore((s) => s.setEditingExpenseId);

    const category = expense.category || "🏷️ Uncategorized";
    const color = categoryColor(category);

    return (
        <motion.div
            className="relative overflow-hidden rounded-2xl"
            drag="x"
            dragConstraints={{ left: -80, right: 0 }}
            dragElastic={0.05}
            onDragEnd={(_, info) => {
                if (info.offset.x < -60) {
                    scheduleDelete(expense);
                }
            }}
        >
            <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500 text-white text-sm font-medium">
                Delete
            </div>
            <button
                onClick={() => setEditingExpenseId(expense.expenseId)}
                className="relative flex w-full items-center gap-3 bg-white/60 dark:bg-slate-800/60 p-3.5 text-left backdrop-blur active:bg-white/90 dark:active:bg-slate-800/90"
            >
                <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ backgroundColor: `${color}1A` }}
                >
                    {categoryEmoji(category)}
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{expense.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{categoryLabel(category)}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-50">{money(expense.amount)}</p>
            </button>
        </motion.div>
    );
}
