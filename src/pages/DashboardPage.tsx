import {useState} from "react";
import {TrendPoint} from "@/types";
import {InsightsSection} from "@/components/insights/InsightsSection";
import {TopHeader} from "@/components/layout/TopHeader";
import {Card} from "@/components/ui/Card";
import {ProgressBar} from "@/components/ui/ProgressBar";
import {PieBreakdown} from "@/components/charts/PieBreakdown";
import {TrendChart} from "@/components/charts/TrendChart";
import {DashboardSkeleton} from "@/components/ui/Skeleton";
import {useDashboardSummary, useTrend} from "@/api/hooks/useDashboard";
import {money} from "@/utils/format";
import {categoryEmoji, categoryLabel} from "@/utils/categoryColors";

export default function DashboardPage() {
    const [selectedMonth, setSelectedMonth] = useState<TrendPoint | null>(null);
    const {
        data: summary,
        isLoading: summaryLoading,
        isError: summaryError,
        error: summaryErrorObj,
    } = useDashboardSummary();
    const {data: trend, isLoading: trendLoading, isError: trendError} = useTrend();
    const {
        data: categorySummary,
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useDashboardSummary(selectedMonth?.monthKey);

    if (summaryLoading) return <DashboardSkeleton/>;

    if (summaryError || !summary) {
        return (
            <div className="mx-4 mt-6 rounded-2xl md:mx-6 lg:mx-8 border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-600 dark:text-red-300">
                <p className="font-medium">Couldn't load dashboard data.</p>
                <p className="mt-1 text-red-500 dark:text-red-300">
                    {summaryErrorObj instanceof Error
                        ? summaryErrorObj.message
                        : "Check that the backend is running and API_SECRET matches."}
                </p>
            </div>
        );
    }

    // Defensive fallbacks -- guards against an API response shape that's
    // missing fields (e.g. server error swallowed upstream, stale deploy,
    // or genuinely zero expenses this month returning a partial payload).
    const expenseTotal = summary.expenseTotal ?? 0;
    const topTags = categorySummary?.topTags ?? [];
    const categoryPeriod = selectedMonth?.label ?? "This Month";
    const trendData = trend ?? [];

    const progress = summary.budget ? (expenseTotal / summary.budget) * 100 : 0;

    return (
        <div className="pb-4">
            <TopHeader title="Dashboard"/>

            <div className="grid gap-4 px-4 pt-2 md:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8">
            {/* Hero card */}
            <section
                className="rounded-3xl bg-gradient-to-br from-brand-700 via-brand-500 to-emerald-500 p-[clamp(1.25rem,1rem+1vw,2rem)] text-white shadow-hero lg:col-span-12">
                <p className="text-sm font-medium text-emerald-100">This Month</p>
                <p className="mt-1 text-[clamp(1.875rem,1.4rem+1.6vw,3rem)] font-bold tracking-tight">{money(expenseTotal)}</p>

                {summary.budget ? (
                    <div className="mt-4 lg:max-w-2xl">
                        <ProgressBar percent={progress}/>
                        <p className="mt-1.5 text-xs text-emerald-100">
                            {money(summary.budget)} budget · {progress.toFixed(0)}% used
                        </p>
                    </div>
                ) : (
                    <p className="mt-3 text-xs text-emerald-100">
                        Set a monthly budget in Settings to track progress
                    </p>
                )}
            </section>

            <InsightsSection/>

            {/* Category breakdown */}
            <section className="lg:col-span-5">
                <Card className="h-full">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Top Categories</h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{categoryPeriod}</p>
                        </div>
                        {selectedMonth && (
                            <button
                                type="button"
                                className="rounded-lg px-2 py-1 text-xs font-medium text-brand-500 dark:text-teal-300 hover:bg-brand-50 dark:hover:bg-teal-900/40"
                                onClick={() => setSelectedMonth(null)}
                            >
                                This month
                            </button>
                        )}
                    </div>
                    {categoriesLoading ? (
                        <p role="status" className="py-8 text-center text-sm text-slate-400">Loading categories…</p>
                    ) : categoriesError ? (
                        <p role="alert" className="py-8 text-center text-sm text-red-600 dark:text-red-300">
                            Couldn't load categories for {categoryPeriod}.
                        </p>
                    ) : topTags.length === 0 ? (
                        <p className="py-8 text-center text-sm text-slate-400">
                            {selectedMonth ? `No spending in ${selectedMonth.label}` : "No spending yet this month"}
                        </p>
                    ) : (
                        <>
                            <PieBreakdown data={topTags}/>
                            <ul className="mt-1 divide-y divide-slate-100 dark:divide-slate-700">
                                {topTags.map((t) => (
                                    <li key={t.name} className="flex items-center justify-between py-2.5">
                    <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{backgroundColor: t.color}}
                      />
                        {categoryEmoji(t.name)} {categoryLabel(t.name)}
                    </span>
                                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {money(t.total)}
                    </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Card>
            </section>

            {/* 6-month trend */}
            <section className="lg:col-span-7">
                <Card className="h-full">
                    <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">6-Month Trend</h2>
                    {trendLoading ? (
                        <div className="h-44 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"/>
                    ) : trendError ? (
                        <p className="py-8 text-center text-sm text-slate-400">Couldn't load trend data</p>
                    ) : (
                        <TrendChart
                            data={trendData}
                            selectedMonthKey={selectedMonth?.monthKey}
                            onSelectMonth={setSelectedMonth}
                        />
                    )}
                </Card>
            </section>
            </div>
        </div>
    );
}
