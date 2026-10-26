import type { ExpenseEntry } from "@/types";

const WEEKEND_DAYS = new Set([0, 6]);

export interface MonthWindow {
    year: number;
    month: number; // 0-based
    daysInMonth: number;
    dayOfMonth: number; // 1-based "today"
    daysLeft: number; // includes today
    startIso: string;
    endIso: string;
}

export function monthWindow(now: Date, monthOffset = 0): MonthWindow {
    const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = first.getFullYear();
    const month = first.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const isCurrent = monthOffset === 0;
    const dayOfMonth = isCurrent ? now.getDate() : daysInMonth;
    return {
        year,
        month,
        daysInMonth,
        dayOfMonth,
        daysLeft: daysInMonth - dayOfMonth + 1,
        startIso: first.toISOString(),
        endIso: new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString(),
    };
}

/** Spend per calendar day; index 0 is day 1. Expenses outside the month are ignored. */
export function dailyTotals(expenses: ExpenseEntry[], win: MonthWindow): number[] {
    const totals = new Array<number>(win.daysInMonth).fill(0);
    for (const e of expenses) {
        const d = new Date(e.date);
        if (d.getFullYear() === win.year && d.getMonth() === win.month) {
            totals[d.getDate() - 1] += e.amount;
        }
    }
    return totals;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export interface SafeToSpend {
    perDay: number;
    remaining: number;
    paceDelta: number; // >0 = ahead of pace (under expected spend), <0 = behind
    expectedSpent: number;
    overBudget: boolean;
}

export function safeToSpend(budget: number, spent: number, win: MonthWindow): SafeToSpend {
    const remaining = budget - spent;
    const expectedSpent = (budget * win.dayOfMonth) / win.daysInMonth;
    return {
        remaining,
        perDay: Math.max(0, remaining) / win.daysLeft,
        paceDelta: expectedSpent - spent,
        expectedSpent,
        overBudget: remaining < 0,
    };
}

export interface Projection {
    projected: number;
    dailyRate: number;
    overBy: number | null; // positive if projected exceeds budget
}

export function projectMonthEnd(spent: number, budget: number | null, win: MonthWindow): Projection {
    const dailyRate = spent / win.dayOfMonth;
    const projected = dailyRate * win.daysInMonth;
    return { projected, dailyRate, overBy: budget ? projected - budget : null };
}

export interface CategoryDelta {
    name: string;
    current: number;
    previous: number;
    delta: number;
    pct: number | null; // null when previous is 0
}

function byCategory(expenses: ExpenseEntry[], upToDay: number, win: MonthWindow): Map<string, number> {
    const map = new Map<string, number>();
    for (const e of expenses) {
        const d = new Date(e.date);
        if (d.getFullYear() !== win.year || d.getMonth() !== win.month || d.getDate() > upToDay) continue;
        const name = e.category || "🏷️ Uncategorized";
        map.set(name, (map.get(name) ?? 0) + e.amount);
    }
    return map;
}

export interface MonthDelta {
    current: number;
    previous: number;
    delta: number;
    categories: CategoryDelta[];
}

/** Compares month-to-date against the same number of days last month. */
export function monthOverMonth(
    current: ExpenseEntry[],
    previous: ExpenseEntry[],
    nowWin: MonthWindow,
    prevWin: MonthWindow,
    topN = 4
): MonthDelta {
    const day = nowWin.dayOfMonth;
    const cur = byCategory(current, day, nowWin);
    const prev = byCategory(previous, day, prevWin);
    const names = new Set([...cur.keys(), ...prev.keys()]);
    const categories = [...names].map((name): CategoryDelta => {
        const c = cur.get(name) ?? 0;
        const p = prev.get(name) ?? 0;
        return { name, current: c, previous: p, delta: c - p, pct: p > 0 ? ((c - p) / p) * 100 : null };
    });
    categories.sort((a, b) => b.current - a.current);
    const currentTotal = sum([...cur.values()]);
    const previousTotal = sum([...prev.values()]);
    return {
        current: currentTotal,
        previous: previousTotal,
        delta: currentTotal - previousTotal,
        categories: categories.slice(0, topN),
    };
}

export function biggestExpenses(expenses: ExpenseEntry[], win: MonthWindow, n = 5): ExpenseEntry[] {
    return expenses
        .filter((e) => {
            const d = new Date(e.date);
            return d.getFullYear() === win.year && d.getMonth() === win.month;
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, n);
}

export type BudgetStatus = "ok" | "warn" | "over";

export function budgetStatus(spent: number, limit: number): BudgetStatus {
    const ratio = spent / limit;
    if (ratio >= 1) return "over";
    return ratio >= 0.8 ? "warn" : "ok";
}

export interface Streak {
    current: number;
    best: number;
}

/**
 * Consecutive completed days (today excluded) with spend within the daily allowance.
 * `days` must be ordered oldest -> newest.
 */
export function underBudgetStreak(days: { spent: number; allowance: number }[]): Streak {
    let best = 0;
    let run = 0;
    for (const d of days) {
        run = d.spent <= d.allowance ? run + 1 : 0;
        best = Math.max(best, run);
    }
    return { current: run, best };
}

export function savingsProgress(budget: number, spent: number, goal: number) {
    const saved = Math.max(0, budget - spent);
    return { saved, percent: goal > 0 ? Math.min(100, (saved / goal) * 100) : 0 };
}

export interface InsightInput {
    delta: MonthDelta;
    daily: number[];
    win: MonthWindow;
    budget: number | null;
    projection: Projection;
}

export interface Insight {
    id: string;
    tone: "good" | "warn" | "info";
    text: string;
}

const rupees = (v: number) => "₹" + Math.round(Math.abs(v)).toLocaleString("en-IN");

export function buildInsights({ delta, daily, win, budget, projection }: InsightInput): Insight[] {
    const out: Insight[] = [];
    const big = delta.categories.find((c) => c.pct !== null && Math.abs(c.pct) >= 10 && c.current > 0);
    if (big?.pct != null) {
        const up = big.pct > 0;
        out.push({
            id: "category-shift",
            tone: up ? "warn" : "good",
            text: `${big.name.replace(/^\S+\s/, "")} is ${up ? "up" : "down"} ${Math.round(Math.abs(big.pct))}% vs last month`,
        });
    }
    const elapsed = daily.slice(0, win.dayOfMonth - 1);
    const zeroDays = elapsed.filter((v) => v === 0).length;
    if (zeroDays > 0) {
        out.push({ id: "zero-days", tone: "good", text: `You spent ₹0 on ${zeroDays} ${zeroDays === 1 ? "day" : "days"} in this month` });
    }
    out.push(...weekendInsight(daily, win), ...projectionInsight(projection, budget));
    return out;
}

function weekendInsight(daily: number[], win: MonthWindow): Insight[] {
    const buckets = { weekend: [] as number[], weekday: [] as number[] };
    daily.slice(0, win.dayOfMonth).forEach((v, i) => {
        const dow = new Date(win.year, win.month, i + 1).getDay();
        buckets[WEEKEND_DAYS.has(dow) ? "weekend" : "weekday"].push(v);
    });
    if (!buckets.weekend.length || !buckets.weekday.length) return [];
    const avgWe = sum(buckets.weekend) / buckets.weekend.length;
    const avgWd = sum(buckets.weekday) / buckets.weekday.length;
    if (avgWd <= 0 || avgWe < avgWd * 1.25) return [];
    return [{ id: "weekend", tone: "info", text: `Weekends average ${rupees(avgWe)}/day, ${Math.round((avgWe / avgWd - 1) * 100)}% above weekdays` }];
}

function projectionInsight(p: Projection, budget: number | null): Insight[] {
    if (!budget || p.overBy === null) return [];
    return p.overBy > 0
        ? [{ id: "projection", tone: "warn", text: `At this pace you'll overshoot your budget by ${rupees(p.overBy)}` }]
        : [{ id: "projection", tone: "good", text: `On track to finish ${rupees(p.overBy)} under budget` }];
}
