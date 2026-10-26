import { describe, expect, it } from "vitest";
import {
    biggestExpenses, budgetStatus, buildInsights, dailyTotals, monthOverMonth, monthWindow,
    projectMonthEnd, safeToSpend, savingsProgress, underBudgetStreak,
} from "../src/utils/insights";
import type { ExpenseEntry } from "../src/types";

const now = new Date(2026, 5, 10, 12); // 10 Jun 2026, 30-day month
const win = monthWindow(now);
const prevWin = monthWindow(now, -1);
const exp = (day: number, amount: number, category = "🍔 Food", month = 5): ExpenseEntry => ({
    expenseId: `${month}-${day}-${amount}`, date: new Date(2026, month, day, 9).getTime(), description: "x", amount, category,
});

describe("monthWindow", () => {
    it("shouldCountDaysLeftIncludingToday", () => {
        expect(win).toMatchObject({ daysInMonth: 30, dayOfMonth: 10, daysLeft: 21 });
    });
    it("shouldTreatPreviousMonthAsComplete", () => {
        expect(prevWin).toMatchObject({ month: 4, daysInMonth: 31, dayOfMonth: 31 });
    });
});

describe("safeToSpend", () => {
    it("shouldDivideRemainingBudgetByDaysLeft", () => {
        const r = safeToSpend(3000, 900, win);
        expect(r.perDay).toBeCloseTo(100);
        expect(r.paceDelta).toBeCloseTo(100); // expected 1000 by day 10, spent 900
    });
    it("shouldReportAheadWhenUnderExpectedPace", () => {
        expect(safeToSpend(3000, 500, win).paceDelta).toBeCloseTo(500);
    });
    it("shouldFlagOverBudgetAndZeroPerDay", () => {
        const r = safeToSpend(1000, 1500, win);
        expect(r).toMatchObject({ overBudget: true, perDay: 0 });
    });
});

describe("projectMonthEnd", () => {
    it("shouldExtrapolateRunRateAndCompareToBudget", () => {
        const p = projectMonthEnd(1000, 2500, win);
        expect(p.projected).toBeCloseTo(3000);
        expect(p.overBy).toBeCloseTo(500);
    });
    it("shouldReturnNullOverByWithoutBudget", () => {
        expect(projectMonthEnd(1000, null, win).overBy).toBeNull();
    });
});

describe("monthOverMonth", () => {
    it("shouldCompareSameDaySpanAndComputeCategoryPct", () => {
        const cur = [exp(2, 300), exp(5, 100, "🚗 Travel")];
        const prev = [exp(3, 200, "🍔 Food", 4), exp(20, 999, "🍔 Food", 4)];
        const d = monthOverMonth(cur, prev, win, prevWin);
        expect(d).toMatchObject({ current: 400, previous: 200, delta: 200 });
        expect(d.categories.find((c) => c.name === "🍔 Food")).toMatchObject({ delta: 100, pct: 50 });
        expect(d.categories.find((c) => c.name === "🚗 Travel")?.pct).toBeNull();
    });
});

describe("dailyTotals & biggestExpenses", () => {
    it("shouldBucketByDayAndIgnoreOtherMonths", () => {
        const t = dailyTotals([exp(1, 10), exp(1, 5), exp(2, 7), exp(2, 99, "x", 4)], win);
        expect(t.slice(0, 3)).toEqual([15, 7, 0]);
    });
    it("shouldReturnTopFiveDescending", () => {
        const list = [1, 2, 3, 4, 5, 6, 7].map((d) => exp(d, d * 10));
        expect(biggestExpenses(list, win).map((e) => e.amount)).toEqual([70, 60, 50, 40, 30]);
    });
});

describe("budgetStatus", () => {
    it("shouldUseAmberAt80AndRedAt100", () => {
        expect([79, 80, 99, 100, 120].map((v) => budgetStatus(v, 100))).toEqual(["ok", "warn", "warn", "over", "over"]);
    });
});

describe("underBudgetStreak", () => {
    it("shouldReturnCurrentAndBestRuns", () => {
        const days = [1, 1, 1, 9, 1, 1].map((spent) => ({ spent, allowance: 5 }));
        expect(underBudgetStreak(days)).toEqual({ current: 2, best: 3 });
    });
});

describe("savingsProgress", () => {
    it("shouldCapAt100AndFloorNegativeSavings", () => {
        expect(savingsProgress(1000, 200, 400).percent).toBe(100);
        expect(savingsProgress(1000, 1200, 400)).toEqual({ saved: 0, percent: 0 });
    });
});

describe("buildInsights", () => {
    it("shouldMentionCategoryShiftZeroDaysAndProjection", () => {
        const cur = [exp(2, 300), exp(4, 100)];
        const prev = [exp(3, 200, "🍔 Food", 4)];
        const daily = dailyTotals(cur, win);
        const delta = monthOverMonth(cur, prev, win, prevWin);
        const texts = buildInsights({ delta, daily, win, budget: 5000, projection: projectMonthEnd(400, 5000, win) }).map((i) => i.text);
        expect(texts).toContain("Food is up 100% vs last month");
        expect(texts).toContain("You spent ₹0 on 7 days in this month");
        expect(texts.some((t) => t.includes("under budget"))).toBe(true);
    });
});
