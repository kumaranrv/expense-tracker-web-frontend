import { Card } from "@/components/ui/Card";
import { money } from "@/utils/format";
import { categoryEmoji, categoryLabel } from "@/utils/categoryColors";
import { budgetStatus, type BudgetStatus } from "@/utils/insights";
import type { CategorySpending } from "@/types";

const STYLE: Record<BudgetStatus, { stroke: string; text: string; label: string }> = {
    ok: { stroke: "#0f766e", text: "text-teal-800 dark:text-teal-200", label: "On track" },
    warn: { stroke: "#d97706", text: "text-amber-700 dark:text-amber-300", label: "Near limit" },
    over: { stroke: "#dc2626", text: "text-red-700 dark:text-red-300", label: "Over budget" },
};

const R = 26;
const C = 2 * Math.PI * R;

function Ring({ item }: { item: CategorySpending & { budgetThreshold: number } }) {
    const status = budgetStatus(item.total, item.budgetThreshold);
    const pct = (item.total / item.budgetThreshold) * 100;
    const s = STYLE[status];
    return (
        <li className="flex flex-col items-center text-center" aria-label={`${categoryLabel(item.name)}: ${Math.round(pct)}% of budget used, ${s.label}`}>
            <div className="relative h-16 w-16">
                <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden="true">
                    <circle cx="32" cy="32" r={R} fill="none" stroke="#e2e8f0" strokeWidth="6"/>
                    <circle
                        cx="32" cy="32" r={R} fill="none" stroke={s.stroke} strokeWidth="6" strokeLinecap="round"
                        strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(1, pct / 100))}
                        className="transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-base" aria-hidden="true">
                    {categoryEmoji(item.name)}
                </span>
            </div>
            <p className="mt-1 max-w-[5rem] truncate text-xs font-medium text-slate-800 dark:text-slate-100">{categoryLabel(item.name)}</p>
            <p className={`text-[11px] font-semibold ${s.text}`}>{Math.round(pct)}%</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">{money(item.total)} / {money(item.budgetThreshold)}</p>
        </li>
    );
}

export function CategoryRings({ categories }: { categories: CategorySpending[] }) {
    const budgeted = categories.filter(
        (c): c is CategorySpending & { budgetThreshold: number } => !!c.budgetThreshold && c.budgetThreshold > 0
    );
    return (
        <Card role="region" aria-labelledby="rings-title" className="h-full">
            <h2 id="rings-title" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category budgets</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Amber at 80%, red at 100%</p>
            {budgeted.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">No category budgets set yet</p>
            ) : (
                <ul className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4">
                    {budgeted.map((c) => <Ring key={c.name} item={c}/>)}
                </ul>
            )}
        </Card>
    );
}
