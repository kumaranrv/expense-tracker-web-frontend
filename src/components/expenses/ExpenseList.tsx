import { ExpenseEntry } from "../../types";
import { groupByDay } from "../../utils/format";
import { ExpenseCard } from "./ExpenseCard";

interface ExpenseListProps {
    expenses: ExpenseEntry[];
    emptyMessage?: string;
}

export function ExpenseList({ expenses, emptyMessage }: ExpenseListProps) {
    if (expenses.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-slate-400">
                <span className="text-4xl">🧾</span>
                <p className="text-sm">{emptyMessage ?? "No expenses found"}</p>
            </div>
        );
    }

    const grouped = groupByDay(expenses);

    return (
        <div className="space-y-5 px-4 md:px-6 lg:px-8">
            {Object.entries(grouped).map(([day, items]) => (
                <div key={day}>
                    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {day}
                    </p>
                    <div className="grid gap-2 xl:grid-cols-2 xl:gap-3">
                        {items.map((expense) => (
                            <ExpenseCard key={expense.expenseId} expense={expense} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
