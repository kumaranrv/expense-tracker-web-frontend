import { Card } from "@/components/ui/Card";
import { money, formatDate } from "@/utils/format";
import { categoryEmoji, categoryLabel } from "@/utils/categoryColors";
import { useUIStore } from "@/store/uiStore";
import type { ExpenseEntry } from "@/types";

export function BiggestExpenses({ expenses }: { expenses: ExpenseEntry[] }) {
    const edit = useUIStore((s) => s.setEditingExpenseId);

    return (
        <Card role="region" aria-labelledby="biggest-title" className="h-full">
            <h2 id="biggest-title" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Biggest expenses</h2>
            {expenses.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No expenses yet this month</p>
            ) : (
                <ol className="mt-2 divide-y divide-slate-100 dark:divide-slate-700">
                    {expenses.map((e, i) => (
                        <li key={e.expenseId}>
                            <button
                                type="button"
                                onClick={() => edit(e.expenseId)}
                                aria-label={`Edit ${e.description}, ${money(e.amount)}`}
                                className="flex min-h-11 w-full items-center gap-3 rounded-lg py-2 text-left hover:bg-white/60 dark:hover:bg-slate-800/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:focus-visible:outline-teal-400"
                            >
                                <span className="w-4 text-xs font-semibold text-slate-500 dark:text-slate-400">{i + 1}</span>
                                <span className="text-lg" aria-hidden="true">{categoryEmoji(e.category ?? "")}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-50">{e.description}</span>
                                    <span className="block text-xs text-slate-600 dark:text-slate-300">
                                        {categoryLabel(e.category ?? "Uncategorized")} · {formatDate(e.date)}
                                    </span>
                                </span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{money(e.amount)}</span>
                            </button>
                        </li>
                    ))}
                </ol>
            )}
        </Card>
    );
}
