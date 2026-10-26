import { Card } from "@/components/ui/Card";
import { money } from "@/utils/format";
import type { MonthWindow, SafeToSpend } from "@/utils/insights";

interface Props {
    safe: SafeToSpend;
    budget: number;
    spent: number;
    win: MonthWindow;
}

export function SafeToSpendCard({ safe, budget, spent, win }: Props) {
    const spentPct = Math.min(100, (spent / budget) * 100);
    const expectedPct = (win.dayOfMonth / win.daysInMonth) * 100;
    const ahead = safe.paceDelta >= 0;
    const paceText = `${money(safe.paceDelta)} ${ahead ? "ahead of" : "behind"} pace`;

    return (
        <Card aria-labelledby="safe-to-spend-title" role="region" className="h-full">
            <h2 id="safe-to-spend-title" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Safe to spend today</h2>
            {safe.overBudget ? (
                <p className="mt-2 text-3xl font-bold text-red-700 dark:text-red-300">Over budget</p>
            ) : (
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                    {money(safe.perDay)}
                    <span className="ml-1 text-sm font-medium text-slate-600 dark:text-slate-300">/ day</span>
                </p>
            )}
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {safe.overBudget ? `${money(safe.remaining)} over` : `${money(safe.remaining)} left`} · {win.daysLeft}{" "}
                {win.daysLeft === 1 ? "day" : "days"} to go
            </p>

            <div className="relative mt-5 h-2 rounded-full bg-slate-200 dark:bg-slate-700" role="img"
                 aria-label={`Spent ${spentPct.toFixed(0)}% of budget; expected ${expectedPct.toFixed(0)}% by today`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${ahead ? "bg-emerald-600" : "bg-amber-600"}`}
                    style={{ width: `${spentPct}%` }}
                />
                <div className="absolute -top-1 h-4 w-0.5 rounded bg-slate-800 dark:bg-slate-600" style={{ left: `${expectedPct}%` }}/>
            </div>
            <p className={`mt-2 text-xs font-semibold ${ahead ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                {ahead ? "▲" : "▼"} {paceText}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Marker shows where you should be today</p>
        </Card>
    );
}
