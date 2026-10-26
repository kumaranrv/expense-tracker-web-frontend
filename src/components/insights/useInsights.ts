import { useMemo } from "react";
import { useDashboardSummary, useCategorySpending } from "@/api/hooks/useDashboard";
import { usePeriodExpenses } from "@/api/hooks/usePeriodExpenses";
import { useSettings } from "@/api/hooks/useSettings";
import {
    biggestExpenses,
    buildInsights,
    dailyTotals,
    monthOverMonth,
    monthWindow,
    projectMonthEnd,
    safeToSpend,
    underBudgetStreak,
    type MonthWindow,
} from "@/utils/insights";

/** Aggregates everything the insight cards need from current + previous month data. */
export function useInsights() {
    const now = useMemo(() => new Date(), []);
    const win = useMemo(() => monthWindow(now), [now]);
    const prevWin = useMemo(() => monthWindow(now, -1), [now]);

    const summary = useDashboardSummary();
    const settings = useSettings();
    const categories = useCategorySpending();
    const current = usePeriodExpenses(win.startIso, win.endIso);
    const previous = usePeriodExpenses(prevWin.startIso, prevWin.endIso);

    const isLoading = summary.isLoading || current.isLoading || previous.isLoading;
    const isError = summary.isError || current.isError || previous.isError;

    const model = useMemo(() => {
        if (!current.data || !previous.data) return null;
        const budget = summary.data?.budget ?? null;
        const spent = summary.data?.expenseTotal ?? 0;
        const daily = dailyTotals(current.data, win);
        const prevDaily = dailyTotals(previous.data, prevWin);
        const delta = monthOverMonth(current.data, previous.data, win, prevWin);
        const projection = projectMonthEnd(spent, budget, win);
        return {
            win,
            budget,
            spent,
            daily,
            delta,
            projection,
            safe: budget ? safeToSpend(budget, spent, win) : null,
            biggest: biggestExpenses(current.data, win),
            insights: buildInsights({ delta, daily, win, budget, projection }),
            streak: budget ? underBudgetStreak(streakDays(prevDaily, daily, budget, win, prevWin)) : null,
        };
    }, [current.data, previous.data, summary.data, win, prevWin]);

    return {
        model,
        isLoading,
        isError,
        categories: categories.data ?? [],
        savingsGoal: settings.data?.savingsGoal ?? null,
    };
}

/** Completed days only, starting from the first day with any spend so empty history doesn't inflate the streak. */
function streakDays(prevDaily: number[], daily: number[], budget: number, win: MonthWindow, prevWin: MonthWindow) {
    const prev = prevDaily.map((spent) => ({ spent, allowance: budget / prevWin.daysInMonth }));
    const cur = daily
        .slice(0, win.dayOfMonth - 1)
        .map((spent) => ({ spent, allowance: budget / win.daysInMonth }));
    const all = [...prev, ...cur];
    const first = all.findIndex((d) => d.spent > 0);
    return first < 0 ? [] : all.slice(first);
}
